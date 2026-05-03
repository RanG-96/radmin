CREATE TABLE IF NOT EXISTS dict_types (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type_code VARCHAR(100) NOT NULL UNIQUE,
    remark TEXT DEFAULT '',
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dict_items (
    id UUID PRIMARY KEY,
    dict_type_id UUID NOT NULL REFERENCES dict_types(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    status BOOLEAN NOT NULL DEFAULT true,
    remark TEXT DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dict_items_type ON dict_items(dict_type_id);
