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
        .route("/api/users/me", get(handler::user::me))
        .route("/api/users/me", put(handler::user::update_me))
}
