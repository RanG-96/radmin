use crate::error::AppError;
use crate::middleware::role::AdminRole;
use crate::model::operation_log::{OperationLogQuery, PaginatedOperationLogs};
use crate::service::operation_log as log_service;
use crate::AppState;
use axum::{
    extract::{Query, State},
    Json,
};

pub async fn list_operation_logs(
    State(state): State<AppState>,
    _admin: AdminRole,
    Query(params): Query<OperationLogQuery>,
) -> Result<Json<PaginatedOperationLogs>, AppError> {
    let result = log_service::list(&state.pool, params).await?;
    Ok(Json(result))
}
