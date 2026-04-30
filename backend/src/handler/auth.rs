use axum::{extract::State, Json};

use crate::AppState;
use crate::error::AppError;
use crate::model::user::{AuthResponse, CreateUser, LoginUser};
use crate::service::auth;

pub async fn register(
    State(state): State<AppState>,
    Json(input): Json<CreateUser>,
) -> Result<Json<AuthResponse>, AppError> {
    if input.username.is_empty() || input.email.is_empty() || input.password.is_empty() {
        return Err(AppError::Validation("All fields are required".into()));
    }
    if input.password.len() < 6 {
        return Err(AppError::Validation("Password must be at least 6 characters".into()));
    }

    let response = auth::register(&state.pool, &state.config, input).await?;
    Ok(Json(response))
}

pub async fn login(
    State(state): State<AppState>,
    Json(input): Json<LoginUser>,
) -> Result<Json<AuthResponse>, AppError> {
    let response = auth::login(&state.pool, &state.config, input).await?;
    Ok(Json(response))
}
