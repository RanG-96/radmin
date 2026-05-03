use crate::error::AppError;
use crate::middleware::jwt::Claims;
use crate::middleware::role::AdminRole;
use crate::model::file::FileResponse;
use crate::model::user::PaginationParams;
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

    let base_url = format!("http://0.0.0.0:{}", state.config.server_port);
    let response = file_service::upload(
        &state.pool,
        id,
        &filename,
        &file_name,
        &content_type,
        data.len() as i64,
        &filepath,
        claims.sub,
        &base_url,
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
    Query(params): Query<PaginationParams>,
) -> Result<Json<crate::model::file::PaginatedFiles>, AppError> {
    let base_url = format!("http://0.0.0.0:{}", state.config.server_port);
    let result = file_service::list(
        &state.pool,
        params.page.unwrap_or(1),
        params.per_page.unwrap_or(20),
        &base_url,
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
