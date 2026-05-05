pub mod admin;
pub mod auth;
pub mod dict;
pub mod file;
pub mod notification;
pub mod setting;
pub mod user;

use axum::{
    routing::get,
    Router,
};

use crate::AppState;

pub fn app_routes() -> Router<AppState> {
    Router::new()
        .merge(auth::routes())
        .merge(user::routes())
        .merge(admin::routes())
        .merge(setting::routes())
        .merge(file::routes())
        .merge(dict::routes())
        .merge(notification::routes())
        .route("/api/health", get(|| async { "ok" }))
}
