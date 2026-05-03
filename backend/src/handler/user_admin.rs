use axum::{
    extract::{Path, Query, State},
    Json,
};
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::role::AdminRole;
use crate::model::user::{
    AdminCreateUser, PaginatedUsers, PaginationParams, UpdateUser, UserResponse,
};
use crate::service::user_admin as user_admin_service;
use crate::AppState;

pub async fn list_users(
    State(state): State<AppState>,
    _admin: AdminRole,
    Query(params): Query<PaginationParams>,
) -> Result<Json<PaginatedUsers>, AppError> {
    let result = user_admin_service::list_users(&state.pool, params).await?;
    Ok(Json(result))
}

pub async fn get_user(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
) -> Result<Json<UserResponse>, AppError> {
    let result = user_admin_service::get_user(&state.pool, id).await?;
    Ok(Json(result))
}

pub async fn create_user(
    State(state): State<AppState>,
    _admin: AdminRole,
    Json(input): Json<AdminCreateUser>,
) -> Result<Json<UserResponse>, AppError> {
    let result = user_admin_service::create_user(&state.pool, input).await?;
    Ok(Json(result))
}

pub async fn update_user(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
    Json(input): Json<UpdateUser>,
) -> Result<Json<UserResponse>, AppError> {
    let result = user_admin_service::update_user(&state.pool, id, input).await?;
    Ok(Json(result))
}

pub async fn delete_user(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    user_admin_service::delete_user(&state.pool, id).await?;
    Ok(Json(serde_json::json!({ "message": "User deleted" })))
}
