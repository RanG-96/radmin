use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Notification {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub content: String,
    #[serde(rename = "type")]
    pub notification_type: String,
    pub is_read: bool,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateNotification {
    pub user_id: Uuid,
    pub title: String,
    pub content: String,
    pub notification_type: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct NotificationResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub content: String,
    #[serde(rename = "type")]
    pub notification_type: String,
    pub is_read: bool,
    pub created_at: NaiveDateTime,
}

impl From<Notification> for NotificationResponse {
    fn from(n: Notification) -> Self {
        Self {
            id: n.id,
            user_id: n.user_id,
            title: n.title,
            content: n.content,
            notification_type: n.notification_type,
            is_read: n.is_read,
            created_at: n.created_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct PaginatedNotifications {
    pub data: Vec<NotificationResponse>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

#[derive(Debug, Serialize)]
pub struct UnreadCount {
    pub count: i64,
}
