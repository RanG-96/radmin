CREATE UNIQUE INDEX IF NOT EXISTS idx_dict_items_type_value_unique
ON dict_items(dict_type_id, value);
