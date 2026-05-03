use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use sqlx::PgPool;

use crate::config::AppConfig;
use crate::error::AppError;
use crate::middleware::jwt::Claims;
use crate::model::user::{AuthResponse, CreateUser, LoginUser, User, UserResponse};

pub async fn register(
    pool: &PgPool,
    config: &AppConfig,
    input: CreateUser,
) -> Result<AuthResponse, AppError> {
    let existing: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users WHERE email = $1")
        .bind(&input.email)
        .fetch_one(pool)
        .await?;

    if existing.0 > 0 {
        return Err(AppError::Validation("Email already registered".into()));
    }

    let password_hash =
        hash(&input.password, DEFAULT_COST).map_err(|e| AppError::Internal(e.into()))?;

    let user = sqlx::query_as::<_, User>(
        r#"INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 'user', NOW(), NOW())
        RETURNING id, username, email, password_hash, role, is_active, created_at, updated_at"#,
    )
    .bind(uuid::Uuid::new_v4())
    .bind(&input.username)
    .bind(&input.email)
    .bind(&password_hash)
    .fetch_one(pool)
    .await?;

    let token = generate_token(&user, config)?;
    let user_response = UserResponse::from(user);

    Ok(AuthResponse {
        token,
        user: user_response,
    })
}

pub async fn login(
    pool: &PgPool,
    config: &AppConfig,
    input: LoginUser,
) -> Result<AuthResponse, AppError> {
    let user = sqlx::query_as::<_, User>(
        r#"SELECT id, username, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE email = $1"#,
    )
    .bind(&input.email)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::Auth("Invalid email or password".into()))?;

    if !user.is_active {
        return Err(AppError::Auth("Account is deactivated".into()));
    }

    let valid =
        verify(&input.password, &user.password_hash).map_err(|e| AppError::Internal(e.into()))?;

    if !valid {
        return Err(AppError::Auth("Invalid email or password".into()));
    }

    let token = generate_token(&user, config)?;
    let user_response = UserResponse::from(user);

    Ok(AuthResponse {
        token,
        user: user_response,
    })
}

fn generate_token(user: &User, config: &AppConfig) -> Result<String, AppError> {
    let expiration = Utc::now() + Duration::hours(config.jwt_expiration_hours as i64);

    let claims = Claims {
        sub: user.id,
        username: user.username.clone(),
        role: user.role.clone(),
        exp: expiration.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(e.into()))
}
