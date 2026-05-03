use axum::{
    extract::{Request, State},
    http::header::AUTHORIZATION,
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use std::time::Instant;
use uuid::Uuid;

use crate::middleware::jwt::Claims;
use crate::AppState;

/// Try to decode JWT claims from the Authorization header.
/// Returns (user_id, username) on success, or (None, None) if no valid token.
fn extract_claims_from_header(req: &Request) -> (Option<Uuid>, Option<String>) {
    let token = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "));

    let Some(token) = token else {
        return (None, None);
    };

    let jwt_secret = match std::env::var("JWT_SECRET") {
        Ok(s) => s,
        Err(_) => return (None, None),
    };

    match decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    ) {
        Ok(data) => (Some(data.claims.sub), Some(data.claims.username)),
        Err(_) => (None, None),
    }
}

pub async fn audit_layer(State(state): State<AppState>, request: Request, next: Next) -> Response {
    let method = request.method().to_string();

    // Only log write operations
    if method != "POST" && method != "PUT" && method != "DELETE" && method != "PATCH" {
        return next.run(request).await;
    }

    let path = request.uri().path().to_string();
    let query = request
        .uri()
        .query()
        .map(|q| q.to_string())
        .unwrap_or_default();
    let ip = request
        .headers()
        .get("x-forwarded-for")
        .or_else(|| request.headers().get("x-real-ip"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    let (user_id, username) = extract_claims_from_header(&request);

    let start = Instant::now();
    let response = next.run(request).await;
    let duration = start.elapsed().as_millis() as i64;
    let status_code = response.status().as_u16() as i32;

    // Fire-and-forget: insert log entry without blocking the response
    let pool = state.pool.clone();
    let method_clone = method.clone();
    let path_clone = path.clone();
    let query_clone = query.clone();
    let ip_clone = ip.clone();
    let username_clone = username.clone();

    tokio::spawn(async move {
        if let Err(e) = sqlx::query(
            r#"INSERT INTO operation_logs (id, user_id, username, method, path, query, ip, status_code, duration_ms, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())"#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(&username_clone)
        .bind(&method_clone)
        .bind(&path_clone)
        .bind(&query_clone)
        .bind(&ip_clone)
        .bind(status_code)
        .bind(duration)
        .execute(&pool)
        .await
        {
            tracing::error!("Audit: failed to save log for {} {}: {}", method_clone, path_clone, e);
        }
    });

    response
}
