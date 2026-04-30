use axum::{
    extract::FromRequestParts,
    http::request::Parts,
};
use std::future::Future;

use crate::error::AppError;
use crate::middleware::jwt::Claims;

#[allow(dead_code)]
pub struct AdminRole(pub Claims);

impl<S> FromRequestParts<S> for AdminRole
where
    S: Send + Sync,
{
    type Rejection = AppError;

    fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> impl Future<Output = Result<Self, Self::Rejection>> + Send {
        let claims_future = Claims::from_request_parts(parts, state);

        async move {
            let claims = claims_future.await?;
            if claims.role != "admin" {
                return Err(AppError::Auth("Admin access required".into()));
            }
            Ok(AdminRole(claims))
        }
    }
}
