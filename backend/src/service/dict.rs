use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::model::dict::{
    CreateDictItem, CreateDictType, DictItem, DictItemResponse, DictItemsByType, DictType,
    DictTypeResponse, PaginatedDictTypes, UpdateDictItem, UpdateDictType,
};

// --- DictType ---

pub async fn list_types(
    pool: &PgPool,
    page: i64,
    per_page: i64,
    q: Option<&str>,
) -> Result<PaginatedDictTypes, AppError> {
    let page = page.max(1);
    let per_page = per_page.clamp(1, 100);
    let offset = (page - 1) * per_page;

    let (total,): (i64,) = if let Some(q) = q {
        sqlx::query_as("SELECT COUNT(*) FROM dict_types WHERE name ILIKE $1 OR type_code ILIKE $1")
            .bind(format!("%{}%", q))
            .fetch_one(pool)
            .await?
    } else {
        sqlx::query_as("SELECT COUNT(*) FROM dict_types")
            .fetch_one(pool)
            .await?
    };

    let types = if let Some(q) = q {
        sqlx::query_as::<_, DictType>(
            r#"SELECT dt.id, dt.name, dt.type_code, dt.remark, dt.status,
               COUNT(di.id)::BIGINT AS item_count, dt.created_at, dt.updated_at
               FROM dict_types dt
               LEFT JOIN dict_items di ON di.dict_type_id = dt.id
               WHERE dt.name ILIKE $1 OR dt.type_code ILIKE $1
               GROUP BY dt.id
               ORDER BY dt.created_at DESC LIMIT $2 OFFSET $3"#,
        )
        .bind(format!("%{}%", q))
        .bind(per_page)
        .bind(offset)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, DictType>(
            r#"SELECT dt.id, dt.name, dt.type_code, dt.remark, dt.status,
               COUNT(di.id)::BIGINT AS item_count, dt.created_at, dt.updated_at
               FROM dict_types dt
               LEFT JOIN dict_items di ON di.dict_type_id = dt.id
               GROUP BY dt.id
               ORDER BY dt.created_at DESC LIMIT $1 OFFSET $2"#,
        )
        .bind(per_page)
        .bind(offset)
        .fetch_all(pool)
        .await?
    };

    Ok(PaginatedDictTypes {
        data: types.into_iter().map(DictTypeResponse::from).collect(),
        total,
        page,
        per_page,
    })
}

pub async fn get_type(pool: &PgPool, id: Uuid) -> Result<DictTypeResponse, AppError> {
    let dict_type = sqlx::query_as::<_, DictType>(
        r#"SELECT dt.id, dt.name, dt.type_code, dt.remark, dt.status,
           COUNT(di.id)::BIGINT AS item_count, dt.created_at, dt.updated_at
           FROM dict_types dt
           LEFT JOIN dict_items di ON di.dict_type_id = dt.id
           WHERE dt.id = $1
           GROUP BY dt.id"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound("选项组不存在".into()))?;

    Ok(DictTypeResponse::from(dict_type))
}

pub async fn create_type(
    pool: &PgPool,
    input: CreateDictType,
) -> Result<DictTypeResponse, AppError> {
    if input.name.is_empty() || input.type_code.is_empty() {
        return Err(AppError::Validation("名称和类型编码不能为空".into()));
    }

    let existing = sqlx::query_as::<_, DictType>(
        "SELECT id, name, type_code, remark, status, created_at, updated_at FROM dict_types WHERE type_code = $1",
    )
    .bind(&input.type_code)
    .fetch_optional(pool)
    .await?;

    if existing.is_some() {
        return Err(AppError::Validation("类型编码已存在".into()));
    }

    let status = input.status.unwrap_or(true);

    let dict_type = sqlx::query_as::<_, DictType>(
        r#"INSERT INTO dict_types (id, name, type_code, remark, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, name, type_code, remark, status, created_at, updated_at"#,
    )
    .bind(Uuid::new_v4())
    .bind(&input.name)
    .bind(&input.type_code)
    .bind(&input.remark)
    .bind(status)
    .fetch_one(pool)
    .await?;

    Ok(DictTypeResponse::from(dict_type))
}

pub async fn update_type(
    pool: &PgPool,
    id: Uuid,
    input: UpdateDictType,
) -> Result<DictTypeResponse, AppError> {
    let existing = sqlx::query_as::<_, DictType>(
        "SELECT id, name, type_code, remark, status, created_at, updated_at FROM dict_types WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound("选项组不存在".into()))?;

    let name = input.name.unwrap_or(existing.name);
    let type_code = input.type_code.unwrap_or(existing.type_code);
    let remark = input.remark.or(existing.remark);
    let status = input.status.unwrap_or(existing.status);

    let type_code_exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM dict_types WHERE type_code = $1 AND id <> $2)",
    )
    .bind(&type_code)
    .bind(id)
    .fetch_one(pool)
    .await?;

    if type_code_exists {
        return Err(AppError::Validation("类型编码已存在".into()));
    }

    let updated = sqlx::query_as::<_, DictType>(
        r#"UPDATE dict_types SET name = $1, type_code = $2, remark = $3, status = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, type_code, remark, status, created_at, updated_at"#,
    )
    .bind(&name)
    .bind(&type_code)
    .bind(&remark)
    .bind(status)
    .bind(id)
    .fetch_one(pool)
    .await?;

    Ok(DictTypeResponse::from(updated))
}

pub async fn delete_type(pool: &PgPool, id: Uuid) -> Result<(), AppError> {
    let item_count =
        sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM dict_items WHERE dict_type_id = $1")
            .bind(id)
            .fetch_one(pool)
            .await?;

    ensure_type_can_be_deleted(item_count)?;

    let result = sqlx::query("DELETE FROM dict_types WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("选项组不存在".into()));
    }

    Ok(())
}

// --- DictItem ---

pub async fn list_items(
    pool: &PgPool,
    dict_type_id: Uuid,
) -> Result<Vec<DictItemResponse>, AppError> {
    let items = sqlx::query_as::<_, DictItem>(
        r#"SELECT id, dict_type_id, label, value, sort_order, status, remark, created_at, updated_at
        FROM dict_items WHERE dict_type_id = $1 ORDER BY sort_order ASC, created_at ASC"#,
    )
    .bind(dict_type_id)
    .fetch_all(pool)
    .await?;

    Ok(items.into_iter().map(DictItemResponse::from).collect())
}

pub async fn create_item(
    pool: &PgPool,
    input: CreateDictItem,
) -> Result<DictItemResponse, AppError> {
    if input.label.is_empty() || input.value.is_empty() {
        return Err(AppError::Validation("标签和值不能为空".into()));
    }

    let value_exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM dict_items WHERE dict_type_id = $1 AND value = $2)",
    )
    .bind(input.dict_type_id)
    .bind(&input.value)
    .fetch_one(pool)
    .await?;

    ensure_dict_item_value_available(value_exists)?;

    let status = input.status.unwrap_or(true);

    let item = sqlx::query_as::<_, DictItem>(
        r#"INSERT INTO dict_items (id, dict_type_id, label, value, sort_order, status, remark, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, dict_type_id, label, value, sort_order, status, remark, created_at, updated_at"#,
    )
    .bind(Uuid::new_v4())
    .bind(input.dict_type_id)
    .bind(&input.label)
    .bind(&input.value)
    .bind(input.sort_order.unwrap_or(0))
    .bind(status)
    .bind(&input.remark)
    .fetch_one(pool)
    .await?;

    Ok(DictItemResponse::from(item))
}

pub async fn update_item(
    pool: &PgPool,
    id: Uuid,
    input: UpdateDictItem,
) -> Result<DictItemResponse, AppError> {
    let existing = sqlx::query_as::<_, DictItem>(
        r#"SELECT id, dict_type_id, label, value, sort_order, status, remark, created_at, updated_at
        FROM dict_items WHERE id = $1"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound("可选项不存在".into()))?;

    let label = input.label.unwrap_or(existing.label);
    let value = input.value.unwrap_or(existing.value);
    let sort_order = input.sort_order.unwrap_or(existing.sort_order);
    let status = input.status.unwrap_or(existing.status);
    let remark = input.remark.or(existing.remark);

    let value_exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM dict_items WHERE dict_type_id = $1 AND value = $2 AND id <> $3)",
    )
    .bind(existing.dict_type_id)
    .bind(&value)
    .bind(id)
    .fetch_one(pool)
    .await?;

    ensure_dict_item_value_available(value_exists)?;

    let updated = sqlx::query_as::<_, DictItem>(
        r#"UPDATE dict_items SET label = $1, value = $2, sort_order = $3, status = $4, remark = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING id, dict_type_id, label, value, sort_order, status, remark, created_at, updated_at"#,
    )
    .bind(&label)
    .bind(&value)
    .bind(sort_order)
    .bind(status)
    .bind(&remark)
    .bind(id)
    .fetch_one(pool)
    .await?;

    Ok(DictItemResponse::from(updated))
}

pub async fn delete_item(pool: &PgPool, id: Uuid) -> Result<(), AppError> {
    let result = sqlx::query("DELETE FROM dict_items WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("可选项不存在".into()));
    }

    Ok(())
}

pub async fn get_by_type_code(pool: &PgPool, type_code: &str) -> Result<DictItemsByType, AppError> {
    let dict_type = sqlx::query_as::<_, DictType>(
        "SELECT id, name, type_code, remark, status, created_at, updated_at FROM dict_types WHERE type_code = $1 AND status = true",
    )
    .bind(type_code)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound("选项组不存在".into()))?;

    let items = sqlx::query_as::<_, DictItem>(
        r#"SELECT id, dict_type_id, label, value, sort_order, status, remark, created_at, updated_at
        FROM dict_items WHERE dict_type_id = $1 AND status = true ORDER BY sort_order ASC"#,
    )
    .bind(dict_type.id)
    .fetch_all(pool)
    .await?;

    Ok(DictItemsByType {
        type_code: type_code.to_string(),
        items: items.into_iter().map(DictItemResponse::from).collect(),
    })
}

fn ensure_type_can_be_deleted(item_count: i64) -> Result<(), AppError> {
    if item_count > 0 {
        return Err(AppError::Validation(
            "该选项组下仍有可选项，不能删除".into(),
        ));
    }

    Ok(())
}

fn ensure_dict_item_value_available(value_exists: bool) -> Result<(), AppError> {
    if value_exists {
        return Err(AppError::Validation("该选项组下的实际值已存在".into()));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{ensure_dict_item_value_available, ensure_type_can_be_deleted};

    #[test]
    fn non_empty_type_cannot_be_deleted() {
        let error = ensure_type_can_be_deleted(1).unwrap_err();
        assert_eq!(
            error.to_string(),
            "Validation error: 该选项组下仍有可选项，不能删除"
        );
    }

    #[test]
    fn duplicate_dict_item_value_is_rejected() {
        let error = ensure_dict_item_value_available(true).unwrap_err();
        assert_eq!(
            error.to_string(),
            "Validation error: 该选项组下的实际值已存在"
        );
    }

    #[test]
    fn empty_type_can_be_deleted_and_unique_value_is_allowed() {
        assert!(ensure_type_can_be_deleted(0).is_ok());
        assert!(ensure_dict_item_value_available(false).is_ok());
    }
}
