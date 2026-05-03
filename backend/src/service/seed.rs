use bcrypt::{hash, DEFAULT_COST};
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::AppConfig;

pub async fn seed_admin(pool: &PgPool, config: &AppConfig) {
    let exists: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users WHERE email = $1")
        .bind(&config.admin_email)
        .fetch_one(pool)
        .await
        .expect("Failed to check admin user");

    if exists.0 > 0 {
        tracing::info!("Admin user already exists, skipping seed");
        return;
    }

    let password_hash =
        hash(&config.admin_password, DEFAULT_COST).expect("Failed to hash admin password");

    sqlx::query(
        r#"INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 'admin', NOW(), NOW())"#,
    )
    .bind(Uuid::new_v4())
    .bind(&config.admin_username)
    .bind(&config.admin_email)
    .bind(&password_hash)
    .execute(pool)
    .await
    .expect("Failed to create admin user");

    tracing::info!(
        "Default admin user created: {} ({})",
        config.admin_username,
        config.admin_email
    );
}
