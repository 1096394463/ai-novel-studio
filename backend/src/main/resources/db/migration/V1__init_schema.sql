-- AI Novel Studio Database Schema
-- SQLite

-- Novels table
CREATE TABLE IF NOT EXISTS novels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    genre TEXT DEFAULT '',
    status TEXT DEFAULT 'draft' CHECK(status IN ('setting', 'draft', 'serializing', 'paused', 'completed', 'locked')),
    synopsis TEXT DEFAULT '',
    cover_path TEXT,
    total_words INTEGER DEFAULT 0,
    target_daily_words INTEGER DEFAULT 2000,
    locked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Volumes table
CREATE TABLE IF NOT EXISTS volumes (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    synopsis TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL,
    volume_id TEXT NOT NULL,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    content_json TEXT DEFAULT '{}',
    content_text TEXT DEFAULT '',
    word_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'ready', 'published', 'archived')),
    locked INTEGER DEFAULT 0,
    locked_until_offset INTEGER,
    last_saved_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (volume_id) REFERENCES volumes(id) ON DELETE CASCADE
);

-- Chapter versions table
CREATE TABLE IF NOT EXISTS chapter_versions (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL,
    content_json TEXT NOT NULL,
    content_text TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    reason TEXT DEFAULT 'auto_save' CHECK(reason IN ('auto_save', 'manual', 'ai_apply')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- World entities table
CREATE TABLE IF NOT EXISTS world_entities (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('character', 'location', 'organization', 'item', 'event', 'timeline')),
    name TEXT NOT NULL,
    aliases TEXT DEFAULT '[]',
    summary TEXT DEFAULT '',
    detail_json TEXT DEFAULT '{}',
    locked INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
);

-- Immutable facts table
CREATE TABLE IF NOT EXISTS immutable_facts (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    fact TEXT NOT NULL,
    source_chapter_id TEXT,
    importance INTEGER DEFAULT 3 CHECK(importance BETWEEN 1 AND 5),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (entity_id) REFERENCES world_entities(id) ON DELETE CASCADE,
    FOREIGN KEY (source_chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'unused' CHECK(status IN ('unused', 'suggested', 'inserted', 'discarded')),
    tags TEXT DEFAULT '[]',
    related_entity_ids TEXT DEFAULT '[]',
    suggested_chapter_id TEXT,
    inserted_chapter_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (suggested_chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
    FOREIGN KEY (inserted_chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
);

-- Graph nodes table
CREATE TABLE IF NOT EXISTS graph_nodes (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL,
    entity_id TEXT,
    node_type TEXT NOT NULL CHECK(node_type IN ('character', 'location', 'organization', 'event', 'item', 'clue')),
    label TEXT NOT NULL,
    x REAL DEFAULT 0,
    y REAL DEFAULT 0,
    style_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES world_entities(id) ON DELETE SET NULL
);

-- Graph edges table
CREATE TABLE IF NOT EXISTS graph_edges (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL,
    source_node_id TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    label TEXT DEFAULT '',
    description TEXT DEFAULT '',
    evidence_chapter_ids TEXT DEFAULT '[]',
    style_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (source_node_id) REFERENCES graph_nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_node_id) REFERENCES graph_nodes(id) ON DELETE CASCADE
);

-- Maps table
CREATE TABLE IF NOT EXISTS maps (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL,
    title TEXT NOT NULL,
    map_type TEXT DEFAULT 'world' CHECK(map_type IN ('world', 'city', 'route', 'battle')),
    scene_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
);

-- Map markers table
CREATE TABLE IF NOT EXISTS map_markers (
    id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL,
    entity_id TEXT,
    marker_type TEXT DEFAULT 'place' CHECK(marker_type IN ('city', 'place', 'route', 'region', 'event')),
    label TEXT NOT NULL,
    x REAL DEFAULT 0,
    y REAL DEFAULT 0,
    metadata_json TEXT DEFAULT '{}',
    FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES world_entities(id) ON DELETE SET NULL
);

-- AI tasks table
CREATE TABLE IF NOT EXISTS ai_tasks (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK(target_type IN ('chapter', 'entity', 'graph', 'map')),
    target_id TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK(task_type IN ('grammar', 'polish', 'consistency', 'idea_suggestion')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'done', 'failed')),
    result_json TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
);

-- Publish sites table
CREATE TABLE IF NOT EXISTS publish_sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'custom' CHECK(type IN ('qidian', 'jjwxc', 'fanqie', 'custom')),
    config_json TEXT DEFAULT '{}',
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Publish jobs table
CREATE TABLE IF NOT EXISTS publish_jobs (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    site_id TEXT NOT NULL,
    scheduled_at TEXT,
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'checking', 'publishing', 'published', 'failed')),
    check_report_json TEXT,
    publish_log TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES publish_sites(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_volumes_novel_id ON volumes(novel_id);
CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id);
CREATE INDEX IF NOT EXISTS idx_chapters_volume_id ON chapters(volume_id);
CREATE INDEX IF NOT EXISTS idx_chapter_versions_chapter_id ON chapter_versions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_world_entities_novel_id ON world_entities(novel_id);
CREATE INDEX IF NOT EXISTS idx_world_entities_type ON world_entities(type);
CREATE INDEX IF NOT EXISTS idx_immutable_facts_entity_id ON immutable_facts(entity_id);
CREATE INDEX IF NOT EXISTS idx_ideas_novel_id ON ideas(novel_id);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_novel_id ON graph_nodes(novel_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_novel_id ON graph_edges(novel_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON graph_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_maps_novel_id ON maps(novel_id);
CREATE INDEX IF NOT EXISTS idx_map_markers_map_id ON map_markers(map_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_novel_id ON ai_tasks(novel_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_publish_jobs_novel_id ON publish_jobs(novel_id);
CREATE INDEX IF NOT EXISTS idx_publish_jobs_status ON publish_jobs(status);

-- Full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS chapters_fts USING fts5(
    title,
    content_text,
    content='chapters',
    content_rowid='rowid'
);

CREATE VIRTUAL TABLE IF NOT EXISTS world_entities_fts USING fts5(
    name,
    summary,
    content='world_entities',
    content_rowid='rowid'
);
