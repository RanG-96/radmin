use axum::{
    routing::{delete, get, post, put},
    Router,
};

use crate::{
    handler,
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/admin/users", get(handler::user_admin::list_users))
        .route("/api/admin/users", post(handler::user_admin::create_user))
        .route("/api/admin/users/{id}", get(handler::user_admin::get_user))
        .route("/api/admin/users/{id}", put(handler::user_admin::update_user))
        .route(
            "/api/admin/users/{id}",
            delete(handler::user_admin::delete_user),
        )
        .route(
            "/api/admin/operation-logs",
            get(handler::operation_log::list_operation_logs),
        )
        .route(
            "/api/admin/notifications",
            post(handler::notification::create_notification),
        )
}
