use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct FileListParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub keyword: Option<String>,
    pub mime_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct FileRecord {
    pub id: Uuid,
    pub filename: String,
    pub original_name: String,
    pub mime_type: String,
    pub size: i64,
    pub path: String,
    pub uploader_id: Option<Uuid>,
    pub uploader_name: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize)]
pub struct FileResponse {
    pub id: Uuid,
    pub filename: String,
    pub original_name: String,
    pub mime_type: String,
    pub size: i64,
    pub url: String,
    pub uploader_id: Option<Uuid>,
    pub uploader_name: Option<String>,
    pub created_at: NaiveDateTime,
}

impl FileRecord {
    pub fn to_response(&self) -> FileResponse {
        FileResponse {
            id: self.id,
            filename: self.filename.clone(),
            original_name: self.original_name.clone(),
            mime_type: self.mime_type.clone(),
            size: self.size,
            url: format!("/api/files/{}/download", self.id),
            uploader_id: self.uploader_id,
            uploader_name: self.uploader_name.clone(),
            created_at: self.created_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct PaginatedFiles {
    pub data: Vec<FileResponse>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}
