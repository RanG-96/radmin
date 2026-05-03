CREATE TABLE IF NOT EXISTS operation_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    username VARCHAR(100) DEFAULT '',
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    query TEXT DEFAULT '',
    body TEXT DEFAULT '',
    ip VARCHAR(50) DEFAULT '',
    status_code INT NOT NULL DEFAULT 0,
    duration_ms BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_op_logs_created ON operation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_op_logs_user ON operation_logs(user_id);
