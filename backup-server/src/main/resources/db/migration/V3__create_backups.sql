CREATE TABLE IF NOT EXISTS backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    version INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    novel_count INTEGER NOT NULL DEFAULT 0,
    chapter_count INTEGER NOT NULL DEFAULT 0,
    total_words BIGINT NOT NULL DEFAULT 0,
    checksum VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_backups_user_id ON backups(user_id);
CREATE INDEX idx_backups_user_version ON backups(user_id, version DESC);
CREATE UNIQUE INDEX idx_backups_user_version_unique ON backups(user_id, version);
