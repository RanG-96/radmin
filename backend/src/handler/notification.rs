use crate::error::AppError;
use crate::middleware::jwt::Claims;
use crate::middleware::role::AdminRole;
use crate::model::notification::{
    CreateNotification, NotificationResponse, PaginatedNotifications, UnreadCount,
};
use crate::model::user::PaginationParams;
use crate::service::notification as notification_service;
use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    Json,
};
use uuid::Uuid;

pub async fn list_notifications(
    State(state): State<AppState>,
    claims: Claims,
    Query(params): Query<PaginationParams>,
) -> Result<Json<PaginatedNotifications>, AppError> {
    let result = notification_service::list(
        &state.pool,
        claims.sub,
        params.page.unwrap_or(1),
        params.per_page.unwrap_or(20),
    )
    .await?;
    Ok(Json(result))
}

pub async fn unread_count(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<Json<UnreadCount>, AppError> {
    let result = notification_service::unread_count(&state.pool, claims.sub).await?;
    Ok(Json(result))
}

pub async fn mark_read(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    notification_service::mark_read(&state.pool, id, claims.sub).await?;
    Ok(Json(serde_json::json!({ "message": "已标记为已读" })))
}

pub async fn mark_all_read(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<Json<serde_json::Value>, AppError> {
    notification_service::mark_all_read(&state.pool, claims.sub).await?;
    Ok(Json(serde_json::json!({ "message": "已全部标记为已读" })))
}

pub async fn create_notification(
    State(state): State<AppState>,
    _admin: AdminRole,
    Json(input): Json<CreateNotification>,
) -> Result<Json<NotificationResponse>, AppError> {
    let result = notification_service::create(&state.pool, input).await?;
    Ok(Json(result))
}
