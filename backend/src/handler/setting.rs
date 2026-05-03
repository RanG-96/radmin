use crate::error::AppError;
use crate::middleware::role::AdminRole;
use crate::model::setting::{SettingResponse, UpdateSettings};
use crate::service::setting;
use crate::AppState;
use axum::{extract::State, Json};

pub async fn get_settings(
    State(state): State<AppState>,
) -> Result<Json<Vec<SettingResponse>>, AppError> {
    let settings = setting::get_all(&state.pool).await?;
    Ok(Json(settings))
}

pub async fn update_settings(
    State(state): State<AppState>,
    _admin: AdminRole,
    Json(input): Json<UpdateSettings>,
) -> Result<Json<Vec<SettingResponse>>, AppError> {
    let settings = setting::update(&state.pool, &input.settings).await?;
    Ok(Json(settings))
}
