use sqlx::{PgPool, Postgres, QueryBuilder};
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
) -> Result<FileResponse, AppError> {
    let record = sqlx::query_as::<_, FileRecord>(
        r#"INSERT INTO files (id, filename, original_name, mime_type, size, path, uploader_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, filename, original_name, mime_type, size, path, uploader_id, NULL::VARCHAR AS uploader_name, created_at"#,
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

    Ok(record.to_response())
}

pub async fn get_by_id(pool: &PgPool, id: Uuid) -> Result<FileRecord, AppError> {
    sqlx::query_as::<_, FileRecord>(
        r#"SELECT f.id, f.filename, f.original_name, f.mime_type, f.size, f.path, f.uploader_id,
           u.username AS uploader_name, f.created_at
           FROM files f
           LEFT JOIN users u ON u.id = f.uploader_id
           WHERE f.id = $1"#,
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
    keyword: Option<&str>,
    mime_type: Option<&str>,
) -> Result<PaginatedFiles, AppError> {
    let page = page.max(1);
    let per_page = per_page.clamp(1, 100);
    let offset = (page - 1) * per_page;
    let trimmed_keyword = keyword.map(str::trim).filter(|value| !value.is_empty());
    let trimmed_mime_type = mime_type.map(str::trim).filter(|value| !value.is_empty());

    let mut count_builder =
        QueryBuilder::<Postgres>::new("SELECT COUNT(*)::BIGINT AS count FROM files f");
    apply_file_filters(&mut count_builder, trimmed_keyword, trimmed_mime_type);

    let (total,): (i64,) = count_builder.build_query_as().fetch_one(pool).await?;

    let mut files_builder = QueryBuilder::<Postgres>::new(
        r#"SELECT f.id, f.filename, f.original_name, f.mime_type, f.size, f.path, f.uploader_id,
           u.username AS uploader_name, f.created_at
           FROM files f
           LEFT JOIN users u ON u.id = f.uploader_id"#,
    );
    apply_file_filters(&mut files_builder, trimmed_keyword, trimmed_mime_type);
    files_builder.push(" ORDER BY f.created_at DESC LIMIT ");
    files_builder.push_bind(per_page);
    files_builder.push(" OFFSET ");
    files_builder.push_bind(offset);

    let files = files_builder.build_query_as::<FileRecord>().fetch_all(pool).await?;

    let data = files.iter().map(FileRecord::to_response).collect();

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

fn apply_file_filters(
    builder: &mut QueryBuilder<'_, Postgres>,
    keyword: Option<&str>,
    mime_type: Option<&str>,
) {
    let mut has_where = false;

    if let Some(keyword) = keyword {
        push_and(builder, &mut has_where);
        builder.push("f.original_name ILIKE ");
        builder.push_bind(format!("%{}%", keyword));
    }

    if let Some(mime_type) = mime_type {
        push_and(builder, &mut has_where);
        push_mime_filter(builder, mime_type);
    }
}

fn push_and(builder: &mut QueryBuilder<'_, Postgres>, has_where: &mut bool) {
    if *has_where {
        builder.push(" AND ");
    } else {
        builder.push(" WHERE ");
        *has_where = true;
    }
}

fn push_mime_filter(builder: &mut QueryBuilder<'_, Postgres>, mime_type: &str) {
    match mime_type {
        "image" => builder.push("f.mime_type LIKE 'image/%'"),
        "document" => builder.push(
            "(f.mime_type = 'application/pdf' \
            OR f.mime_type = 'application/msword' \
            OR f.mime_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' \
            OR f.mime_type = 'application/vnd.ms-excel' \
            OR f.mime_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' \
            OR f.mime_type = 'application/vnd.ms-powerpoint' \
            OR f.mime_type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation' \
            OR f.mime_type = 'text/plain' \
            OR f.mime_type = 'text/csv')",
        ),
        "media" => builder.push("(f.mime_type LIKE 'audio/%' OR f.mime_type LIKE 'video/%')"),
        "other" => builder.push(
            "f.mime_type NOT LIKE 'image/%' \
            AND f.mime_type NOT LIKE 'audio/%' \
            AND f.mime_type NOT LIKE 'video/%' \
            AND f.mime_type <> 'application/pdf' \
            AND f.mime_type <> 'application/msword' \
            AND f.mime_type <> 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' \
            AND f.mime_type <> 'application/vnd.ms-excel' \
            AND f.mime_type <> 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' \
            AND f.mime_type <> 'application/vnd.ms-powerpoint' \
            AND f.mime_type <> 'application/vnd.openxmlformats-officedocument.presentationml.presentation' \
            AND f.mime_type <> 'text/plain' \
            AND f.mime_type <> 'text/csv'",
        ),
        _ => builder.push("1 = 1"),
    };
}
