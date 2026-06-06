import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Users,
  MapPin,
  Building,
  Package,
  Calendar,
  Lightbulb,
  Plus,
  Lock,
  Unlock,
  Tag,
} from "lucide-react";
import { useWorldStore, useIdeaStore } from "@/stores";
import type { EntityType, WorldEntity } from "@/types";

const entityTypes: { type: EntityType; label: string; icon: typeof Users }[] = [
  { type: "character", label: "人物", icon: Users },
  { type: "location", label: "地点", icon: MapPin },
  { type: "organization", label: "组织", icon: Building },
  { type: "item", label: "物品", icon: Package },
  { type: "event", label: "事件", icon: Calendar },
  { type: "timeline", label: "时间线", icon: Calendar },
];

export function WorldBiblePage() {
  const { novelId } = useParams<{ novelId: string }>();
  const {
    entities,
    currentEntity,
    fetchEntities,
    fetchEntity,
    createEntity,
    updateEntity,
  } = useWorldStore();
  const { ideas, fetchIdeas } = useIdeaStore();

  const [selectedType, setSelectedType] = useState<EntityType>("character");
  const [isCreating, setIsCreating] = useState(false);
  const [newEntityName, setNewEntityName] = useState("");

  useEffect(() => {
    if (novelId) {
      fetchEntities(novelId, selectedType);
      fetchIdeas(novelId);
    }
  }, [novelId, selectedType, fetchEntities, fetchIdeas]);

  const handleCreateEntity = async () => {
    if (!novelId || !newEntityName.trim()) return;
    try {
      await createEntity(novelId, {
        type: selectedType,
        name: newEntityName.trim(),
        summary: "",
        aliases: [],
        tags: [],
        locked: false,
      });
      setNewEntityName("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create entity:", error);
    }
  };

  const handleToggleLock = async (entity: WorldEntity) => {
    await updateEntity(entity.id, { locked: !entity.locked });
  };

  const selectedTypeInfo = entityTypes.find((t) => t.type === selectedType);

  return (
    <div className="flex h-full">
      {/* Entity Type Navigation */}
      <aside className="w-48 border-r bg-card overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold mb-4">设定类型</h2>
          <nav className="space-y-1">
            {entityTypes.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors">
              <Lightbulb className="w-4 h-4" />
              灵感池
            </button>
          </div>
        </div>
      </aside>

      {/* Entity List */}
      <aside className="w-64 border-r bg-card overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{selectedTypeInfo?.label}</h2>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1 rounded hover:bg-accent"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Create New Entity */}
          {isCreating && (
            <div className="mb-4 p-2 border rounded-md">
              <input
                type="text"
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
                placeholder="名称"
                className="w-full px-2 py-1 text-sm border rounded mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateEntity}
                  className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
                >
                  创建
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-2 py-1 text-xs border rounded"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Entity List */}
          <div className="space-y-1">
            {entities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => fetchEntity(entity.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  currentEntity?.id === entity.id
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{entity.name}</span>
                  {entity.locked && <Lock className="w-3 h-3 text-destructive" />}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {entity.summary || "暂无摘要"}
                </p>
              </button>
            ))}

            {entities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                暂无{selectedTypeInfo?.label}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Entity Detail */}
      <div className="flex-1 overflow-y-auto">
        {currentEntity ? (
          <div className="p-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{currentEntity.name}</h1>
              <button
                onClick={() => handleToggleLock(currentEntity)}
                className={`p-2 rounded hover:bg-accent ${
                  currentEntity.locked ? "text-destructive" : ""
                }`}
              >
                {currentEntity.locked ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <Unlock className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Aliases */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">
                别名
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {currentEntity.aliases.map((alias, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-sm bg-secondary rounded"
                  >
                    {alias}
                  </span>
                ))}
                <button className="px-2 py-1 text-sm border rounded hover:bg-accent">
                  + 添加
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">
                标签
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {currentEntity.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary rounded"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                <button className="px-2 py-1 text-sm border rounded hover:bg-accent">
                  + 添加
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground">
                摘要
              </label>
              <textarea
                value={currentEntity.summary}
                onChange={(e) => {
                  updateEntity(currentEntity.id, { summary: e.target.value });
                }}
                className="w-full mt-1 p-3 border rounded-md resize-none"
                rows={3}
                placeholder="添加摘要..."
              />
            </div>

            {/* Detail JSON */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground">
                详细设定
              </label>
              <div className="mt-1 p-4 border rounded-md bg-muted/50">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(currentEntity.detailJson, null, 2) || "{}"}
                </pre>
              </div>
            </div>

            {/* Immutable Facts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  不可改动事实
                </label>
                <button className="text-sm text-primary hover:underline">
                  + 添加事实
                </button>
              </div>
              <div className="space-y-2">
                {/* TODO: Fetch and display immutable facts */}
                <p className="text-sm text-muted-foreground">
                  暂无不可改动事实
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            选择一个{selectedTypeInfo?.label}查看详情
          </div>
        )}
      </div>

      {/* Idea Suggestions Panel */}
      <aside className="w-64 border-l bg-card overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold mb-4">灵感池</h2>
          <div className="space-y-2">
            {ideas.slice(0, 5).map((idea) => (
              <div
                key={idea.id}
                className="p-2 border rounded-md text-sm hover:bg-accent/50 cursor-pointer"
              >
                <p className="font-medium truncate">{idea.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {idea.content}
                </p>
              </div>
            ))}
            {ideas.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                暂无灵感
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
