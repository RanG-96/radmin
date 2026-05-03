use sqlx::PgPool;
use std::collections::HashMap;

use crate::error::AppError;
use crate::model::setting::{Setting, SettingResponse};

pub async fn get_all(pool: &PgPool) -> Result<Vec<SettingResponse>, AppError> {
    let settings = sqlx::query_as::<_, Setting>("SELECT key, value, updated_at FROM settings")
        .fetch_all(pool)
        .await?;

    Ok(settings
        .into_iter()
        .map(|s| SettingResponse {
            key: s.key,
            value: s.value,
        })
        .collect())
}

pub async fn update(
    pool: &PgPool,
    settings: &HashMap<String, String>,
) -> Result<Vec<SettingResponse>, AppError> {
    for (key, value) in settings {
        sqlx::query(
            "INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
        )
        .bind(key)
        .bind(value)
        .execute(pool)
        .await?;
    }

    get_all(pool).await
}
