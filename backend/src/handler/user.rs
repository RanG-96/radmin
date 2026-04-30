use axum::{extract::State, Json};

use crate::AppState;
use crate::error::AppError;
use crate::middleware::jwt::Claims;
use crate::model::user::{User, UserResponse};

pub async fn me(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<Json<UserResponse>, AppError> {
    let user = sqlx::query_as::<_, User>(
        r#"SELECT id, username, email, password_hash, created_at FROM users WHERE id = $1"#,
    )
    .bind(claims.sub)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    Ok(Json(UserResponse::from(user)))
}
