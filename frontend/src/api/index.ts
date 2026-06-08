const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:18080/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Novel API
export const novelApi = {
  list: () => request<Novel[]>("/novels"),
  get: (id: string) => request<Novel>(`/novels/${id}`),
  create: (data: Partial<Novel>) =>
    request<Novel>("/novels", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Novel>) =>
    request<Novel>(`/novels/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  lock: (id: string) =>
    request<void>(`/novels/${id}/lock`, { method: "POST" }),
  unlock: (id: string) =>
    request<void>(`/novels/${id}/unlock`, { method: "POST" }),
  delete: (id: string) =>
    request<void>(`/novels/${id}`, { method: "DELETE" }),
  recalculateWords: (id: string) =>
    request<Novel>(`/novels/${id}/recalculate-words`, { method: "POST" }),
};

// Chapter API
export const chapterApi = {
  list: (novelId: string) =>
    request<Chapter[]>(`/novels/${novelId}/chapters`),
  get: (id: string) => request<Chapter>(`/chapters/${id}`),
  create: (novelId: string, data: Partial<Chapter>) =>
    request<Chapter>(`/novels/${novelId}/chapters`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Chapter>) =>
    request<Chapter>(`/chapters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  save: (id: string, content: { contentJson: string; contentText: string }) =>
    request<void>(`/chapters/${id}/save`, {
      method: "POST",
      body: JSON.stringify(content),
    }),
  lock: (id: string) =>
    request<void>(`/chapters/${id}/lock`, { method: "POST" }),
  unlock: (id: string) =>
    request<void>(`/chapters/${id}/unlock`, { method: "POST" }),
  versions: (id: string) =>
    request<ChapterVersion[]>(`/chapters/${id}/versions`),
  restoreVersion: (id: string, versionId: string) =>
    request<void>(`/chapters/${id}/restore-version/${versionId}`, {
      method: "POST",
    }),
};

// World Entity API
export const entityApi = {
  list: (novelId: string, type?: string) =>
    request<WorldEntity[]>(
      `/novels/${novelId}/entities${type ? `?type=${type}` : ""}`
    ),
  get: (id: string) => request<WorldEntity>(`/entities/${id}`),
  create: (novelId: string, data: Partial<WorldEntity>) =>
    request<WorldEntity>(`/novels/${novelId}/entities`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<WorldEntity>) =>
    request<WorldEntity>(`/entities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  addFact: (entityId: string, fact: Partial<ImmutableFact>) =>
    request<ImmutableFact>(`/entities/${entityId}/facts`, {
      method: "POST",
      body: JSON.stringify(fact),
    }),
  deleteFact: (entityId: string, factId: string) =>
    request<void>(`/entities/${entityId}/facts/${factId}`, {
      method: "DELETE",
    }),
  getFacts: (entityId: string) =>
    request<ImmutableFact[]>(`/entities/${entityId}/facts`),
};

// Idea API
export const ideaApi = {
  list: (novelId: string) =>
    request<Idea[]>(`/novels/${novelId}/ideas`),
  create: (novelId: string, data: Partial<Idea>) =>
    request<Idea>(`/novels/${novelId}/ideas`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Idea>) =>
    request<Idea>(`/ideas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  markInserted: (id: string, chapterId: string) =>
    request<void>(`/ideas/${id}/mark-inserted`, {
      method: "POST",
      body: JSON.stringify({ chapterId }),
    }),
};

// Graph API
export const graphApi = {
  get: (novelId: string) =>
    request<{ nodes: GraphNode[]; edges: GraphEdge[] }>(
      `/novels/${novelId}/graph`
    ),
  createNode: (novelId: string, data: Partial<GraphNode>) =>
    request<GraphNode>(`/novels/${novelId}/graph/nodes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateNode: (id: string, data: Partial<GraphNode>) =>
    request<GraphNode>(`/graph/nodes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteNode: (id: string) =>
    request<void>(`/graph/nodes/${id}`, { method: "DELETE" }),
  createEdge: (novelId: string, data: Partial<GraphEdge>) =>
    request<GraphEdge>(`/novels/${novelId}/graph/edges`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEdge: (id: string, data: Partial<GraphEdge>) =>
    request<GraphEdge>(`/graph/edges/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteEdge: (id: string) =>
    request<void>(`/graph/edges/${id}`, { method: "DELETE" }),
};

// Map API
export const mapApi = {
  list: (novelId: string) =>
    request<GameMap[]>(`/novels/${novelId}/maps`),
  get: (id: string) => request<GameMap>(`/maps/${id}`),
  create: (novelId: string, data: Partial<GameMap>) =>
    request<GameMap>(`/novels/${novelId}/maps`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<GameMap>) =>
    request<GameMap>(`/maps/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  addMarker: (mapId: string, data: Partial<MapMarker>) =>
    request<MapMarker>(`/maps/${mapId}/markers`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMarker: (mapId: string, markerId: string, data: Partial<MapMarker>) =>
    request<MapMarker>(`/maps/${mapId}/markers/${markerId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteMarker: (mapId: string, markerId: string) =>
    request<void>(`/maps/${mapId}/markers/${markerId}`, {
      method: "DELETE",
    }),
};

// AI API
export const aiApi = {
  grammarCheck: (data: { chapterId: string; text?: string }) =>
    request<AiTask>("/ai/grammar-check", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  polish: (data: { chapterId: string; text: string; style?: string }) =>
    request<AiTask>("/ai/polish", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  expand: (data: { chapterId: string; text: string }) =>
    request<AiTask>("/ai/expand", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  consistencyCheck: (data: { chapterId: string }) =>
    request<AiTask>("/ai/consistency-check", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  ideaSuggestions: (data: { chapterId: string }) =>
    request<AiTask>("/ai/idea-suggestions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Publish API
export const publishApi = {
  sites: () => request<PublishSite[]>("/publish/sites"),
  createSite: (data: Partial<PublishSite>) =>
    request<PublishSite>("/publish/sites", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSite: (id: string, data: Partial<PublishSite>) =>
    request<PublishSite>(`/publish/sites/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  jobs: () => request<PublishJob[]>("/publish/jobs"),
  createJob: (data: Partial<PublishJob>) =>
    request<PublishJob>("/publish/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  precheck: (id: string) =>
    request<PublishJob>(`/publish/jobs/${id}/precheck`, { method: "POST" }),
  publish: (id: string) =>
    request<PublishJob>(`/publish/jobs/${id}/publish`, { method: "POST" }),
  logs: (id: string) =>
    request<string>(`/publish/jobs/${id}/logs`),
};

// Import types
import type {
  Novel,
  Chapter,
  ChapterVersion,
  WorldEntity,
  ImmutableFact,
  Idea,
  GraphNode,
  GraphEdge,
  GameMap,
  MapMarker,
  AiTask,
  PublishSite,
  PublishJob,
} from "@/types";
