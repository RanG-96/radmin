use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct OperationLog {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub username: Option<String>,
    pub method: String,
    pub path: String,
    pub query: Option<String>,
    pub body: Option<String>,
    pub ip: Option<String>,
    pub status_code: i32,
    pub duration_ms: i64,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize)]
pub struct OperationLogResponse {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub username: Option<String>,
    pub method: String,
    pub path: String,
    pub query: Option<String>,
    pub body: Option<String>,
    pub ip: Option<String>,
    pub status_code: i32,
    pub duration_ms: i64,
    pub created_at: NaiveDateTime,
}

impl From<OperationLog> for OperationLogResponse {
    fn from(log: OperationLog) -> Self {
        Self {
            id: log.id,
            user_id: log.user_id,
            username: log.username,
            method: log.method,
            path: log.path,
            query: log.query,
            body: log.body,
            ip: log.ip,
            status_code: log.status_code,
            duration_ms: log.duration_ms,
            created_at: log.created_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct OperationLogQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub username: Option<String>,
    pub path: Option<String>,
    pub method: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedOperationLogs {
    pub data: Vec<OperationLogResponse>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}
