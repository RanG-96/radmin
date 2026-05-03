use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::model::notification::{
    CreateNotification, Notification, NotificationResponse, PaginatedNotifications, UnreadCount,
};

pub async fn list(
    pool: &PgPool,
    user_id: Uuid,
    page: i64,
    per_page: i64,
) -> Result<PaginatedNotifications, AppError> {
    let page = page.max(1);
    let per_page = per_page.clamp(1, 100);
    let offset = (page - 1) * per_page;

    let (total,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM notifications WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;

    let notifications = sqlx::query_as::<_, Notification>(
        r#"SELECT id, user_id, title, content, type as notification_type, is_read, created_at
        FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"#,
    )
    .bind(user_id)
    .bind(per_page)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    Ok(PaginatedNotifications {
        data: notifications
            .into_iter()
            .map(NotificationResponse::from)
            .collect(),
        total,
        page,
        per_page,
    })
}

pub async fn unread_count(pool: &PgPool, user_id: Uuid) -> Result<UnreadCount, AppError> {
    let (count,): (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false")
            .bind(user_id)
            .fetch_one(pool)
            .await?;

    Ok(UnreadCount { count })
}

pub async fn mark_read(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<(), AppError> {
    let result =
        sqlx::query("UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2")
            .bind(id)
            .bind(user_id)
            .execute(pool)
            .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("通知不存在".into()));
    }

    Ok(())
}

pub async fn mark_all_read(pool: &PgPool, user_id: Uuid) -> Result<(), AppError> {
    sqlx::query("UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false")
        .bind(user_id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn create(
    pool: &PgPool,
    input: CreateNotification,
) -> Result<NotificationResponse, AppError> {
    if input.title.is_empty() {
        return Err(AppError::Validation("标题不能为空".into()));
    }

    let notification = sqlx::query_as::<_, Notification>(
        r#"INSERT INTO notifications (id, user_id, title, content, type, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, false, NOW())
        RETURNING id, user_id, title, content, type as notification_type, is_read, created_at"#,
    )
    .bind(Uuid::new_v4())
    .bind(input.user_id)
    .bind(&input.title)
    .bind(&input.content)
    .bind(input.notification_type.as_deref().unwrap_or("system"))
    .fetch_one(pool)
    .await?;

    Ok(NotificationResponse::from(notification))
}
