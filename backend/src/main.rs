mod config;
mod db;
mod error;
mod handler;
mod middleware;
mod model;
mod service;

use axum::{routing::{get, post}, Router};
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

    let state = AppState {
        pool,
        config,
    };

    let app = Router::new()
        .route("/api/auth/register", post(handler::auth::register))
        .route("/api/auth/login", post(handler::auth::login))
        .route("/api/users/me", get(handler::user::me))
        .route("/api/health", get(|| async { "ok" }))
        .with_state(state)
        .layer(middleware::cors::cors_layer())
        .layer(TraceLayer::new_for_http());

    let addr = format!("0.0.0.0:{}", port);
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind");

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
