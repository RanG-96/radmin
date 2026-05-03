use sqlx::PgPool;

use crate::error::AppError;
use crate::model::operation_log::{
    OperationLog, OperationLogQuery, OperationLogResponse, PaginatedOperationLogs,
};

pub async fn list(
    pool: &PgPool,
    params: OperationLogQuery,
) -> Result<PaginatedOperationLogs, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;

    // Build dynamic query
    let mut conditions = vec!["1=1".to_string()];
    let mut bind_idx = 1;

    if params.username.is_some() {
        conditions.push(format!("username ILIKE ${}", bind_idx));
        bind_idx += 1;
    }
    if params.path.is_some() {
        conditions.push(format!("path ILIKE ${}", bind_idx));
        bind_idx += 1;
    }
    if params.method.is_some() {
        conditions.push(format!("method = ${}", bind_idx));
        bind_idx += 1;
    }

    let where_clause = conditions.join(" AND ");

    // Count query
    let count_sql = format!("SELECT COUNT(*) FROM operation_logs WHERE {}", where_clause);
    let mut count_query = sqlx::query_as::<_, (i64,)>(&count_sql);
    if let Some(ref username) = params.username {
        count_query = count_query.bind(format!("%{}%", username));
    }
    if let Some(ref path) = params.path {
        count_query = count_query.bind(format!("%{}%", path));
    }
    if let Some(ref method) = params.method {
        count_query = count_query.bind(method);
    }
    let (total,): (i64,) = count_query.fetch_one(pool).await?;

    // Data query
    let data_sql = format!(
        "SELECT id, user_id, username, method, path, query, body, ip, status_code, duration_ms, created_at
         FROM operation_logs WHERE {} ORDER BY created_at DESC LIMIT ${} OFFSET ${}",
        where_clause, bind_idx, bind_idx + 1
    );
    let mut data_query = sqlx::query_as::<_, OperationLog>(&data_sql);
    if let Some(ref username) = params.username {
        data_query = data_query.bind(format!("%{}%", username));
    }
    if let Some(ref path) = params.path {
        data_query = data_query.bind(format!("%{}%", path));
    }
    if let Some(ref method) = params.method {
        data_query = data_query.bind(method);
    }
    data_query = data_query.bind(per_page).bind(offset);
    let logs = data_query.fetch_all(pool).await?;

    Ok(PaginatedOperationLogs {
        data: logs.into_iter().map(OperationLogResponse::from).collect(),
        total,
        page,
        per_page,
    })
}
