use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// --- DictType ---

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DictType {
    pub id: Uuid,
    pub name: String,
    pub type_code: String,
    pub remark: Option<String>,
    pub status: bool,
    #[sqlx(default)]
    pub item_count: i64,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateDictType {
    pub name: String,
    pub type_code: String,
    pub remark: Option<String>,
    pub status: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDictType {
    pub name: Option<String>,
    pub type_code: Option<String>,
    pub remark: Option<String>,
    pub status: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct DictTypeResponse {
    pub id: Uuid,
    pub name: String,
    pub type_code: String,
    pub remark: Option<String>,
    pub status: bool,
    pub item_count: i64,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

impl From<DictType> for DictTypeResponse {
    fn from(t: DictType) -> Self {
        Self {
            id: t.id,
            name: t.name,
            type_code: t.type_code,
            remark: t.remark,
            status: t.status,
            item_count: t.item_count,
            created_at: t.created_at,
            updated_at: t.updated_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct PaginatedDictTypes {
    pub data: Vec<DictTypeResponse>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

// --- DictItem ---

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DictItem {
    pub id: Uuid,
    pub dict_type_id: Uuid,
    pub label: String,
    pub value: String,
    pub sort_order: i32,
    pub status: bool,
    pub remark: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateDictItem {
    pub dict_type_id: Uuid,
    pub label: String,
    pub value: String,
    pub sort_order: Option<i32>,
    pub remark: Option<String>,
    pub status: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDictItem {
    pub label: Option<String>,
    pub value: Option<String>,
    pub sort_order: Option<i32>,
    pub status: Option<bool>,
    pub remark: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DictItemResponse {
    pub id: Uuid,
    pub dict_type_id: Uuid,
    pub label: String,
    pub value: String,
    pub sort_order: i32,
    pub status: bool,
    pub remark: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

impl From<DictItem> for DictItemResponse {
    fn from(item: DictItem) -> Self {
        Self {
            id: item.id,
            dict_type_id: item.dict_type_id,
            label: item.label,
            value: item.value,
            sort_order: item.sort_order,
            status: item.status,
            remark: item.remark,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct DictItemsByType {
    pub type_code: String,
    pub items: Vec<DictItemResponse>,
}
