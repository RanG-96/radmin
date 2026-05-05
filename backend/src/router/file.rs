use axum::{
    routing::{delete, get, post},
    Router,
};

use crate::{
    handler,
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/files/upload", post(handler::file::upload))
        .route("/api/files", get(handler::file::list_files))
        .route("/api/files/{id}/download", get(handler::file::download))
        .route("/api/files/{id}", delete(handler::file::delete_file))
}
