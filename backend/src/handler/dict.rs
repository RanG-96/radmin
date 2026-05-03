use crate::error::AppError;
use crate::middleware::jwt::Claims;
use crate::middleware::role::AdminRole;
use crate::model::dict::{
    CreateDictItem, CreateDictType, DictItemResponse, DictItemsByType, DictTypeResponse,
    PaginatedDictTypes, UpdateDictItem, UpdateDictType,
};
use crate::service::dict as dict_service;
use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct DictTypeQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub q: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct DictItemQuery {
    pub dict_type_id: Uuid,
}

// --- DictType handlers ---

pub async fn list_dict_types(
    State(state): State<AppState>,
    _admin: AdminRole,
    Query(params): Query<DictTypeQuery>,
) -> Result<Json<PaginatedDictTypes>, AppError> {
    let result = dict_service::list_types(
        &state.pool,
        params.page.unwrap_or(1),
        params.per_page.unwrap_or(20),
        params.q.as_deref(),
    )
    .await?;
    Ok(Json(result))
}

pub async fn create_dict_type(
    State(state): State<AppState>,
    _admin: AdminRole,
    Json(input): Json<CreateDictType>,
) -> Result<Json<DictTypeResponse>, AppError> {
    let result = dict_service::create_type(&state.pool, input).await?;
    Ok(Json(result))
}

pub async fn get_dict_type(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
) -> Result<Json<DictTypeResponse>, AppError> {
    let result = dict_service::get_type(&state.pool, id).await?;
    Ok(Json(result))
}

pub async fn update_dict_type(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
    Json(input): Json<UpdateDictType>,
) -> Result<Json<DictTypeResponse>, AppError> {
    let result = dict_service::update_type(&state.pool, id, input).await?;
    Ok(Json(result))
}

pub async fn delete_dict_type(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    dict_service::delete_type(&state.pool, id).await?;
    Ok(Json(serde_json::json!({ "message": "选项组已删除" })))
}

// --- DictItem handlers ---

pub async fn list_dict_items(
    State(state): State<AppState>,
    _admin: AdminRole,
    Query(params): Query<DictItemQuery>,
) -> Result<Json<Vec<DictItemResponse>>, AppError> {
    let result = dict_service::list_items(&state.pool, params.dict_type_id).await?;
    Ok(Json(result))
}

pub async fn create_dict_item(
    State(state): State<AppState>,
    _admin: AdminRole,
    Json(input): Json<CreateDictItem>,
) -> Result<Json<DictItemResponse>, AppError> {
    let result = dict_service::create_item(&state.pool, input).await?;
    Ok(Json(result))
}

pub async fn update_dict_item(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
    Json(input): Json<UpdateDictItem>,
) -> Result<Json<DictItemResponse>, AppError> {
    let result = dict_service::update_item(&state.pool, id, input).await?;
    Ok(Json(result))
}

pub async fn delete_dict_item(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    dict_service::delete_item(&state.pool, id).await?;
    Ok(Json(serde_json::json!({ "message": "可选项已删除" })))
}

// --- Public: get dict items by type_code ---

pub async fn get_dict_by_type_code(
    State(state): State<AppState>,
    _claims: Claims,
    Path(type_code): Path<String>,
) -> Result<Json<DictItemsByType>, AppError> {
    let result = dict_service::get_by_type_code(&state.pool, &type_code).await?;
    Ok(Json(result))
}
