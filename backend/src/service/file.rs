use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::model::file::{FileRecord, FileResponse, PaginatedFiles};

pub async fn upload(
    pool: &PgPool,
    id: Uuid,
    filename: &str,
    original_name: &str,
    mime_type: &str,
    size: i64,
    path: &str,
    uploader_id: Uuid,
    base_url: &str,
) -> Result<FileResponse, AppError> {
    let record = sqlx::query_as::<_, FileRecord>(
        r#"INSERT INTO files (id, filename, original_name, mime_type, size, path, uploader_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, filename, original_name, mime_type, size, path, uploader_id, created_at"#,
    )
    .bind(id)
    .bind(filename)
    .bind(original_name)
    .bind(mime_type)
    .bind(size)
    .bind(path)
    .bind(uploader_id)
    .fetch_one(pool)
    .await?;

    Ok(record.to_response(base_url))
}

pub async fn get_by_id(pool: &PgPool, id: Uuid) -> Result<FileRecord, AppError> {
    sqlx::query_as::<_, FileRecord>(
        "SELECT id, filename, original_name, mime_type, size, path, uploader_id, created_at FROM files WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound("文件不存在".into()))
}

pub async fn list(
    pool: &PgPool,
    page: i64,
    per_page: i64,
    base_url: &str,
) -> Result<PaginatedFiles, AppError> {
    let page = page.max(1);
    let per_page = per_page.clamp(1, 100);
    let offset = (page - 1) * per_page;

    let (total,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM files")
        .fetch_one(pool)
        .await?;

    let files = sqlx::query_as::<_, FileRecord>(
        "SELECT id, filename, original_name, mime_type, size, path, uploader_id, created_at
         FROM files ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    )
    .bind(per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let data = files.iter().map(|f| f.to_response(base_url)).collect();

    Ok(PaginatedFiles {
        data,
        total,
        page,
        per_page,
    })
}

pub async fn delete(pool: &PgPool, id: Uuid) -> Result<(), AppError> {
    let file = get_by_id(pool, id).await?;

    let _ = tokio::fs::remove_file(&file.path).await;

    sqlx::query("DELETE FROM files WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(())
}
