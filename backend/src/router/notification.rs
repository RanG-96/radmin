use axum::{
    routing::{get, put},
    Router,
};

use crate::{
    handler,
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/notifications", get(handler::notification::list_notifications))
        .route(
            "/api/notifications/unread-count",
            get(handler::notification::unread_count),
        )
        .route(
            "/api/notifications/{id}/read",
            put(handler::notification::mark_read),
        )
        .route(
            "/api/notifications/read-all",
            put(handler::notification::mark_all_read),
        )
}
