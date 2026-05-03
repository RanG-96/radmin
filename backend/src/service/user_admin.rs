use bcrypt::{hash, DEFAULT_COST};
use sqlx::PgPool;
use uuid::Uuid;
use validator::{Validate, ValidationErrors};

use crate::error::AppError;
use crate::model::user::{
    AdminCreateUser, PaginatedUsers, PaginationParams, UpdateUser, User, UserResponse,
};

pub async fn list_users(
    pool: &PgPool,
    params: PaginationParams,
) -> Result<PaginatedUsers, AppError> {
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
        .fetch_all(pool)
        .await?;

        let total: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM users WHERE username ILIKE $1 OR email ILIKE $1")
                .bind(&pattern)
                .fetch_one(pool)
                .await?;

        (users, total.0)
    } else {
        let users = sqlx::query_as::<_, User>(
            r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at
            FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2"#,
        )
        .bind(per_page)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
            .fetch_one(pool)
            .await?;

        (users, total.0)
    };

    Ok(PaginatedUsers {
        data: users.into_iter().map(UserResponse::from).collect(),
        total,
        page,
        per_page,
    })
}

pub async fn get_user(pool: &PgPool, id: Uuid) -> Result<UserResponse, AppError> {
    let user = sqlx::query_as::<_, User>(
        r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE id = $1"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound("用户不存在".into()))?;

    Ok(UserResponse::from(user))
}

pub async fn create_user(pool: &PgPool, input: AdminCreateUser) -> Result<UserResponse, AppError> {
    validate_payload(&input)?;

    let existing: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users WHERE email = $1")
        .bind(&input.email)
        .fetch_one(pool)
        .await?;

    if existing.0 > 0 {
        return Err(AppError::Validation("该邮箱已被注册".into()));
    }

    let password_hash =
        hash(&input.password, DEFAULT_COST).map_err(|e| AppError::Internal(e.into()))?;

    let role = input.role.unwrap_or_else(|| "user".to_string());
    ensure_role_supported(&role)?;

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
    .fetch_one(pool)
    .await?;

    Ok(UserResponse::from(user))
}

pub async fn update_user(
    pool: &PgPool,
    id: Uuid,
    input: UpdateUser,
) -> Result<UserResponse, AppError> {
    validate_payload(&input)?;

    let user = sqlx::query_as::<_, User>(
        r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE id = $1"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound("用户不存在".into()))?;

    let username = input.username.unwrap_or(user.username);
    let email = input.email.unwrap_or(user.email);
    let role = input.role.unwrap_or(user.role);
    let is_active = input.is_active.unwrap_or(user.is_active);

    ensure_role_supported(&role)?;

    let email_owner: Option<Uuid> =
        sqlx::query_scalar("SELECT id FROM users WHERE email = $1 AND id <> $2")
            .bind(&email)
            .bind(id)
            .fetch_optional(pool)
            .await?;

    if email_owner.is_some() {
        return Err(AppError::Validation("该邮箱已被其他用户使用".into()));
    }

    sqlx::query(
        r#"UPDATE users SET username = $1, email = $2, role = $3, is_active = $4, updated_at = NOW() WHERE id = $5"#,
    )
    .bind(&username)
    .bind(&email)
    .bind(&role)
    .bind(is_active)
    .bind(id)
    .execute(pool)
    .await?;

    get_user(pool, id).await
}

pub async fn delete_user(pool: &PgPool, id: Uuid) -> Result<(), AppError> {
    let result = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("用户不存在".into()));
    }

    Ok(())
}

fn validate_payload<T: Validate>(input: &T) -> Result<(), AppError> {
    input
        .validate()
        .map_err(|errors| AppError::Validation(validation_error_message(&errors)))?;
    Ok(())
}

fn validation_error_message(errors: &ValidationErrors) -> String {
    errors
        .field_errors()
        .values()
        .flat_map(|items| items.iter())
        .find_map(|error| error.message.as_ref().map(|msg| msg.to_string()))
        .unwrap_or_else(|| "输入内容不合法".to_string())
}

fn ensure_role_supported(role: &str) -> Result<(), AppError> {
    if role != "admin" && role != "user" {
        return Err(AppError::Validation("角色必须是管理员或普通用户".into()));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{ensure_role_supported, validation_error_message};
    use validator::ValidationErrors;

    #[test]
    fn unsupported_role_is_rejected() {
        let error = ensure_role_supported("owner").unwrap_err();
        assert_eq!(
            error.to_string(),
            "Validation error: 角色必须是管理员或普通用户"
        );
    }

    #[test]
    fn validation_error_message_returns_first_user_friendly_message() {
        let mut errors = ValidationErrors::new();
        errors.add(
            "email",
            validator::ValidationError {
                code: std::borrow::Cow::Borrowed("email"),
                message: Some(std::borrow::Cow::Borrowed("请输入有效邮箱")),
                params: std::collections::HashMap::new(),
            },
        );

        assert_eq!(validation_error_message(&errors), "请输入有效邮箱");
    }
}
