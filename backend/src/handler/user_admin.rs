use axum::{
    extract::{Path, Query, State},
    Json,
};
use bcrypt::{hash, DEFAULT_COST};
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError;
use crate::middleware::role::AdminRole;
use crate::model::user::{
    AdminCreateUser, PaginatedUsers, PaginationParams, UpdateUser, User, UserResponse,
};

pub async fn list_users(
    State(state): State<AppState>,
    _admin: AdminRole,
    Query(params): Query<PaginationParams>,
) -> Result<Json<PaginatedUsers>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;

    let (users, total) = if let Some(q) = &params.q {
        let pattern = format!("%{}%", q);
        let users = sqlx::query_as::<_, User>(
            r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at
            FROM users WHERE username ILIKE $1 OR email ILIKE $1
            ORDER BY created_at DESC LIMIT $2 OFFSET $3"#,
        )
        .bind(&pattern)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&state.pool)
        .await?;

        let total: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM users WHERE username ILIKE $1 OR email ILIKE $1",
        )
        .bind(&pattern)
        .fetch_one(&state.pool)
        .await?;

        (users, total.0)
    } else {
        let users = sqlx::query_as::<_, User>(
            r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at
            FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2"#,
        )
        .bind(per_page)
        .bind(offset)
        .fetch_all(&state.pool)
        .await?;

        let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
            .fetch_one(&state.pool)
            .await?;

        (users, total.0)
    };

    Ok(Json(PaginatedUsers {
        data: users.into_iter().map(UserResponse::from).collect(),
        total,
        page,
        per_page,
    }))
}

pub async fn get_user(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
) -> Result<Json<UserResponse>, AppError> {
    let user = sqlx::query_as::<_, User>(
        r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE id = $1"#,
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    Ok(Json(UserResponse::from(user)))
}

pub async fn create_user(
    State(state): State<AppState>,
    _admin: AdminRole,
    Json(input): Json<AdminCreateUser>,
) -> Result<Json<UserResponse>, AppError> {
    if input.username.is_empty() || input.email.is_empty() || input.password.is_empty() {
        return Err(AppError::Validation("All fields are required".into()));
    }
    if input.password.len() < 6 {
        return Err(AppError::Validation("Password must be at least 6 characters".into()));
    }

    let existing: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users WHERE email = $1")
        .bind(&input.email)
        .fetch_one(&state.pool)
        .await?;

    if existing.0 > 0 {
        return Err(AppError::Validation("Email already registered".into()));
    }

    let password_hash = hash(&input.password, DEFAULT_COST)
        .map_err(|e| AppError::Internal(e.into()))?;

    let role = input.role.unwrap_or_else(|| "user".to_string());
    if role != "admin" && role != "user" {
        return Err(AppError::Validation("Role must be 'admin' or 'user'".into()));
    }

    let user = sqlx::query_as::<_, User>(
        r#"INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, username, email, password_hash, role, is_active, created_at, updated_at"#,
    )
    .bind(Uuid::new_v4())
    .bind(&input.username)
    .bind(&input.email)
    .bind(&password_hash)
    .bind(&role)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(UserResponse::from(user)))
}

pub async fn update_user(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
    Json(input): Json<UpdateUser>,
) -> Result<Json<UserResponse>, AppError> {
    let user = sqlx::query_as::<_, User>(
        r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE id = $1"#,
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    let username = input.username.unwrap_or(user.username);
    let email = input.email.unwrap_or(user.email);
    let role = input.role.unwrap_or(user.role);
    let is_active = input.is_active.unwrap_or(user.is_active);

    if role != "admin" && role != "user" {
        return Err(AppError::Validation("Role must be 'admin' or 'user'".into()));
    }

    sqlx::query(
        r#"UPDATE users SET username = $1, email = $2, role = $3, is_active = $4, updated_at = NOW() WHERE id = $5"#,
    )
    .bind(&username)
    .bind(&email)
    .bind(&role)
    .bind(is_active)
    .bind(id)
    .execute(&state.pool)
    .await?;

    let updated = sqlx::query_as::<_, User>(
        r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE id = $1"#,
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(UserResponse::from(updated)))
}

pub async fn delete_user(
    State(state): State<AppState>,
    _admin: AdminRole,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("User not found".into()));
    }

    Ok(Json(serde_json::json!({ "message": "User deleted" })))
}
