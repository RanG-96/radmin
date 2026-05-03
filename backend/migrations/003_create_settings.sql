CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
    ('site_title', 'Radmin'),
    ('site_description', 'Admin Panel'),
    ('site_logo', ''),
    ('site_footer', '')
ON CONFLICT (key) DO NOTHING;
