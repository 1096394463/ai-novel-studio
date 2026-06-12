-- V2: Add annotations table
CREATE TABLE IF NOT EXISTS annotations (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL,
    novel_id TEXT NOT NULL,
    start_offset INTEGER NOT NULL,
    end_offset INTEGER NOT NULL,
    selected_text TEXT,
    content TEXT,
    color TEXT DEFAULT '#fef08a',
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_annotations_chapter ON annotations(chapter_id);
CREATE INDEX IF NOT EXISTS idx_annotations_novel ON annotations(novel_id);
