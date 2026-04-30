use axum::{extract::State, Json};
use bcrypt::{hash, DEFAULT_COST};

use crate::AppState;
use crate::error::AppError;
use crate::middleware::jwt::Claims;
use crate::model::user::{UpdateMe, User, UserResponse};

pub async fn me(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<Json<UserResponse>, AppError> {
    let user = sqlx::query_as::<_, User>(
        r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE id = $1"#,
    )
    .bind(claims.sub)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    Ok(Json(UserResponse::from(user)))
}

pub async fn update_me(
    State(state): State<AppState>,
    claims: Claims,
    Json(input): Json<UpdateMe>,
) -> Result<Json<UserResponse>, AppError> {
    let mut user = sqlx::query_as::<_, User>(
        r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE id = $1"#,
    )
    .bind(claims.sub)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    if let Some(username) = &input.username {
        user.username = username.clone();
    }
    if let Some(email) = &input.email {
        user.email = email.clone();
    }

    let password_hash = if let Some(password) = &input.password {
        if password.len() < 6 {
            return Err(AppError::Validation("Password must be at least 6 characters".into()));
        }
        Some(hash(password, DEFAULT_COST).map_err(|e| AppError::Internal(e.into()))?)
    } else {
        None
    };

    sqlx::query(
        r#"UPDATE users SET username = $1, email = $2, password_hash = COALESCE($3, password_hash), updated_at = NOW() WHERE id = $4"#,
    )
    .bind(&user.username)
    .bind(&user.email)
    .bind(&password_hash)
    .bind(claims.sub)
    .execute(&state.pool)
    .await?;

    Ok(Json(UserResponse::from(user)))
}
