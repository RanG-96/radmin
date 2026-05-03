use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Setting {
    pub key: String,
    pub value: String,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSettings {
    pub settings: std::collections::HashMap<String, String>,
}

#[derive(Debug, Serialize)]
pub struct SettingResponse {
    pub key: String,
    pub value: String,
}
