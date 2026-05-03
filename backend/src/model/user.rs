use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub role: String,
    pub is_active: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUser {
    #[validate(length(min = 2, message = "用户名至少需要 2 个字符"))]
    pub username: String,
    #[validate(email(message = "请输入有效邮箱"))]
    pub email: String,
    #[validate(length(min = 6, message = "密码至少需要 6 个字符"))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct AdminCreateUser {
    #[validate(length(min = 2, message = "用户名至少需要 2 个字符"))]
    pub username: String,
    #[validate(email(message = "请输入有效邮箱"))]
    pub email: String,
    #[validate(length(min = 6, message = "密码至少需要 6 个字符"))]
    pub password: String,
    pub role: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateUser {
    #[validate(length(min = 2, message = "用户名至少需要 2 个字符"))]
    pub username: Option<String>,
    #[validate(email(message = "请输入有效邮箱"))]
    pub email: Option<String>,
    pub role: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMe {
    pub username: Option<String>,
    pub email: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginUser {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub q: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub role: String,
    pub is_active: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct PaginatedUsers {
    pub data: Vec<UserResponse>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}
