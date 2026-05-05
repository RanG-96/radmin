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
        .route("/api/settings", get(handler::setting::get_settings))
        .route("/api/settings", put(handler::setting::update_settings))
}
