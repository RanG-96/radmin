use axum::{
    routing::post,
    Router,
};

use crate::{
    handler,
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/auth/register", post(handler::auth::register))
        .route("/api/auth/login", post(handler::auth::login))
}
