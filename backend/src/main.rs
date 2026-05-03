mod config;
mod db;
mod error;
mod handler;
mod middleware;
mod model;
mod service;

use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub config: AppConfig,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = AppConfig::from_env();
    let port = config.server_port;
    let pool = db::create_pool(&config.database_url).await;

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    // Seed default admin
    service::seed::seed_admin(&pool, &config).await;

    let state = AppState { pool, config };

    let app = Router::new()
        // Auth
        .route("/api/auth/register", post(handler::auth::register))
        .route("/api/auth/login", post(handler::auth::login))
        // User (self)
        .route("/api/users/me", get(handler::user::me))
        .route("/api/users/me", put(handler::user::update_me))
        // Admin: user management
        .route("/api/admin/users", get(handler::user_admin::list_users))
        .route("/api/admin/users", post(handler::user_admin::create_user))
        .route("/api/admin/users/{id}", get(handler::user_admin::get_user))
        .route(
            "/api/admin/users/{id}",
            put(handler::user_admin::update_user),
        )
        .route(
            "/api/admin/users/{id}",
            delete(handler::user_admin::delete_user),
        )
        // Settings
        .route("/api/settings", get(handler::setting::get_settings))
        .route("/api/settings", put(handler::setting::update_settings))
        // Files
        .route("/api/files/upload", post(handler::file::upload))
        .route("/api/files", get(handler::file::list_files))
        .route("/api/files/{id}/download", get(handler::file::download))
        .route("/api/files/{id}", delete(handler::file::delete_file))
        // Dict types (admin)
        .route("/api/admin/dict-types", get(handler::dict::list_dict_types))
        .route(
            "/api/admin/dict-types",
            post(handler::dict::create_dict_type),
        )
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
        // Dict items (admin)
        .route("/api/admin/dict-items", get(handler::dict::list_dict_items))
        .route(
            "/api/admin/dict-items",
            post(handler::dict::create_dict_item),
        )
        .route(
            "/api/admin/dict-items/{id}",
            put(handler::dict::update_dict_item),
        )
        .route(
            "/api/admin/dict-items/{id}",
            delete(handler::dict::delete_dict_item),
        )
        // Dict by type_code (authenticated)
        .route(
            "/api/dict/{type_code}",
            get(handler::dict::get_dict_by_type_code),
        )
        // Operation logs (admin)
        .route(
            "/api/admin/operation-logs",
            get(handler::operation_log::list_operation_logs),
        )
        // Notifications
        .route(
            "/api/notifications",
            get(handler::notification::list_notifications),
        )
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
        .route(
            "/api/admin/notifications",
            post(handler::notification::create_notification),
        )
        // Health
        .route("/api/health", get(|| async { "ok" }))
        .with_state(state.clone())
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            middleware::audit::audit_layer,
        ))
        .layer(middleware::cors::cors_layer())
        .layer(TraceLayer::new_for_http());

    let addr = format!("0.0.0.0:{}", port);
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind");

    axum::serve(listener, app).await.expect("Server failed");
}
