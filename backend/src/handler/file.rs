use crate::error::AppError;
use crate::middleware::jwt::Claims;
use crate::middleware::role::AdminRole;
use crate::model::file::{FileListParams, FileResponse};
use crate::service::file as file_service;
use crate::AppState;
use axum::{
    body::Body,
    extract::{Multipart, Path, Query, State},
    http::{header, StatusCode},
    response::Response,
    Json,
};
use uuid::Uuid;

const MAX_UPLOAD_SIZE_BYTES: usize = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES: &[&str] = &[
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/vnd.rar",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "video/mp4",
    "video/webm",
    "video/quicktime",
];

pub async fn upload(
    State(state): State<AppState>,
    claims: Claims,
    mut multipart: Multipart,
) -> Result<Json<FileResponse>, AppError> {
    let upload_dir = &state.config.upload_dir;

    let field = multipart
        .next_field()
        .await
        .map_err(|e| AppError::Validation(format!("读取上传文件失败: {}", e)))?
        .ok_or_else(|| AppError::Validation("未选择文件".into()))?;

    let file_name = field.file_name().unwrap_or("unknown").to_string();
    let content_type = field
        .content_type()
        .unwrap_or("application/octet-stream")
        .to_string();
    let data = field
        .bytes()
        .await
        .map_err(|e| AppError::Validation(format!("读取文件数据失败: {}", e)))?;

    ensure_file_size_allowed(data.len())?;
    ensure_mime_type_allowed(&content_type)?;

    let id = Uuid::new_v4();
    let ext = file_name.rsplit('.').next().unwrap_or("bin");
    let filename = format!("{}.{}", id, ext);
    let filepath = format!("{}/{}", upload_dir, filename);

    tokio::fs::create_dir_all(upload_dir)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("创建上传目录失败: {}", e)))?;

    tokio::fs::write(&filepath, &data)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("写入文件失败: {}", e)))?;

    let response = file_service::upload(
        &state.pool,
        id,
        &filename,
        &file_name,
        &content_type,
        data.len() as i64,
        &filepath,
        claims.sub,
    )
    .await?;

    Ok(Json(response))
}

pub async fn download(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Response, AppError> {
    let file = file_service::get_by_id(&state.pool, id).await?;

    let data = tokio::fs::read(&file.path)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("读取文件失败: {}", e)))?;

    let response = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, &file.mime_type)
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", file.original_name),
        )
        .body(Body::from(data))
        .map_err(|e| AppError::Internal(anyhow::anyhow!("构建响应失败: {}", e)))?;

    Ok(response)
}

pub async fn list_files(
    State(state): State<AppState>,
    _admin: AdminRole,
    Query(params): Query<FileListParams>,
) -> Result<Json<crate::model::file::PaginatedFiles>, AppError> {
    let result = file_service::list(
        &state.pool,
        params.page.unwrap_or(1),
        params.per_page.unwrap_or(20),
        params.keyword.as_deref(),
        params.mime_type.as_deref(),
    )
    .await?;
    Ok(Json(result))
}

pub async fn delete_file(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    file_service::delete(&state.pool, id).await?;
    Ok(Json(serde_json::json!({ "message": "文件已删除" })))
}

fn ensure_file_size_allowed(size: usize) -> Result<(), AppError> {
    if size > MAX_UPLOAD_SIZE_BYTES {
        return Err(AppError::Validation("文件大小不能超过 10MB".into()));
    }

    Ok(())
}

fn ensure_mime_type_allowed(mime_type: &str) -> Result<(), AppError> {
    if ALLOWED_MIME_TYPES.contains(&mime_type) {
        return Ok(());
    }

    Err(AppError::Validation(format!(
        "暂不支持该文件类型：{}",
        mime_type
    )))
}
