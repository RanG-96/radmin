use std::future::Future;
use axum::{
    extract::FromRequestParts,
    http::request::Parts,
};
use axum::http::header::AUTHORIZATION;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Uuid,
    pub username: String,
    pub exp: usize,
}

impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
{
    type Rejection = AppError;

    fn from_request_parts(
        parts: &mut Parts,
        _state: &S,
    ) -> impl Future<Output = Result<Self, Self::Rejection>> + Send {
        let auth_header = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .map(|s| s.to_string());

        async move {
            let auth_header = auth_header
                .ok_or_else(|| AppError::Auth("Missing Authorization header".into()))?;

            let token = auth_header
                .strip_prefix("Bearer ")
                .ok_or_else(|| AppError::Auth("Invalid Authorization header format".into()))?;

            let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");

            let token_data = decode::<Claims>(
                token,
                &DecodingKey::from_secret(jwt_secret.as_bytes()),
                &Validation::new(Algorithm::HS256),
            )
            .map_err(|_| AppError::Auth("Invalid or expired token".into()))?;

            Ok(token_data.claims)
        }
    }
}
