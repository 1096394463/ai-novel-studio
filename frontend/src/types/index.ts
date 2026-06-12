// Novel types
export interface Novel {
  id: string;
  title: string;
  genre: string;
  status: "setting" | "draft" | "serializing" | "paused" | "completed" | "locked";
  synopsis: string;
  coverPath: string | null;
  totalWords: number;
  targetDailyWords: number;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Volume {
  id: string;
  novelId: string;
  title: string;
  sortOrder: number;
  synopsis: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  volumeId: string;
  title: string;
  sortOrder: number;
  contentJson: string; // TipTap JSON
  contentText: string; // Plain text
  wordCount: number;
  status: "draft" | "ready" | "published" | "archived";
  locked: boolean;
  lockedUntilOffset: number | null;
  lastSavedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterVersion {
  id: string;
  chapterId: string;
  contentJson: string;
  contentText: string;
  wordCount: number;
  reason: "auto_save" | "manual" | "ai_apply";
  createdAt: string;
}

// World Bible types
export type EntityType =
  | "character"
  | "location"
  | "organization"
  | "item"
  | "event"
  | "timeline";

export interface WorldEntity {
  id: string;
  novelId: string;
  type: EntityType;
  name: string;
  aliases: string[];
  summary: string;
  detailJson: Record<string, unknown>;
  locked: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ImmutableFact {
  id: string;
  entityId: string;
  fact: string;
  sourceChapterId: string | null;
  importance: number; // 1-5
  createdAt: string;
}

export type IdeaStatus = "unused" | "suggested" | "inserted" | "discarded";

export interface Idea {
  id: string;
  novelId: string;
  title: string;
  content: string;
  status: IdeaStatus;
  tags: string[];
  relatedEntityIds: string[];
  suggestedChapterId: string | null;
  insertedChapterId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Graph types
export type NodeType =
  | "character"
  | "location"
  | "organization"
  | "event"
  | "item"
  | "clue";

export interface GraphNode {
  id: string;
  novelId: string;
  entityId: string | null;
  nodeType: NodeType;
  label: string;
  x: number;
  y: number;
  styleJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  id: string;
  novelId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string;
  label: string;
  description: string;
  evidenceChapterIds: string[];
  styleJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Map types
export type MapType = "world" | "city" | "route" | "battle";

export interface GameMap {
  id: string;
  novelId: string;
  title: string;
  mapType: MapType;
  sceneJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type MarkerType = "city" | "place" | "route" | "region" | "event";

export interface MapMarker {
  id: string;
  mapId: string;
  entityId: string | null;
  markerType: MarkerType;
  label: string;
  x: number;
  y: number;
  metadataJson: Record<string, unknown>;
}

// AI types
export type TaskType =
  | "grammar"
  | "polish"
  | "consistency"
  | "idea_suggestion";

export type TaskStatus = "pending" | "running" | "done" | "failed";

export interface AiTask {
  id: string;
  novelId: string;
  targetType: "chapter" | "entity" | "graph" | "map";
  targetId: string;
  taskType: TaskType;
  status: TaskStatus;
  resultJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// Publishing types
export type SiteType = "qidian" | "jjwxc" | "fanqie" | "custom";

export interface PublishSite {
  id: string;
  name: string;
  type: SiteType;
  configJson: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
}

export type JobStatus =
  | "scheduled"
  | "checking"
  | "publishing"
  | "published"
  | "failed";

export interface PublishJob {
  id: string;
  novelId: string;
  chapterId: string;
  siteId: string;
  scheduledAt: string;
  status: JobStatus;
  checkReportJson: Record<string, unknown> | null;
  publishLog: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Annotation {
  id: string;
  chapterId: string;
  novelId: string;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}
