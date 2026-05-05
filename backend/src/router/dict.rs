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
        .route("/api/admin/dict-types", get(handler::dict::list_dict_types))
        .route("/api/admin/dict-types", post(handler::dict::create_dict_type))
        .route(
            "/api/admin/dict-types/{id}",
            get(handler::dict::get_dict_type),
        )
        .route(
            "/api/admin/dict-types/{id}",
            put(handler::dict::update_dict_type),
        )
        .route(
            "/api/admin/dict-types/{id}",
            delete(handler::dict::delete_dict_type),
        )
        .route("/api/admin/dict-items", get(handler::dict::list_dict_items))
        .route("/api/admin/dict-items", post(handler::dict::create_dict_item))
        .route(
            "/api/admin/dict-items/{id}",
            put(handler::dict::update_dict_item),
        )
        .route(
            "/api/admin/dict-items/{id}",
            delete(handler::dict::delete_dict_item),
        )
        .route(
            "/api/dict/{type_code}",
            get(handler::dict::get_dict_by_type_code),
        )
}
