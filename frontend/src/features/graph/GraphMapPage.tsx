import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Users,
  MapPin,
  Building,
  Calendar,
  Package,
  Search,
  Plus,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { graphApi, mapApi } from "@/api";
import type { GraphNode, GraphEdge, GameMap, MapMarker } from "@/types";

const nodeTypeIcons: Record<string, typeof Users> = {
  character: Users,
  location: MapPin,
  organization: Building,
  event: Calendar,
  item: Package,
  clue: Search,
};

const nodeTypeColors: Record<string, string> = {
  character: "#3b82f6",
  location: "#22c55e",
  organization: "#a855f7",
  event: "#f97316",
  item: "#eab308",
  clue: "#ec4899",
};

const relationTypes = [
  "旧识",
  "亲属",
  "敌对",
  "同盟",
  "师徒",
  "恋人",
  "利用",
  "隐瞒",
  "因果",
  "拥有",
  "出现于",
];

export function GraphMapPage() {
  const { novelId } = useParams<{ novelId: string }>();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "map">("graph");

  useEffect(() => {
    if (novelId) {
      loadGraph();
      loadMaps();
    }
  }, [novelId]);

  const loadGraph = async () => {
    if (!novelId) return;
    try {
      const data = await graphApi.get(novelId);
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (error) {
      console.error("Failed to load graph:", error);
    }
  };

  const loadMaps = async () => {
    if (!novelId) return;
    try {
      const data = await mapApi.list(novelId);
      setMaps(data);
    } catch (error) {
      console.error("Failed to load maps:", error);
    }
  };

  const handleAddNode = async (type: string) => {
    if (!novelId) return;
    try {
      const node = await graphApi.createNode(novelId, {
        nodeType: type as GraphNode["nodeType"],
        label: `新${nodeTypeIcons[type]?.displayName || "节点"}`,
        x: Math.random() * 500,
        y: Math.random() * 500,
        styleJson: { color: nodeTypeColors[type] },
      });
      setNodes([...nodes, node]);
    } catch (error) {
      console.error("Failed to add node:", error);
    }
  };

  const handleAddEdge = async () => {
    if (!novelId || !selectedNode) return;
    // TODO: Implement edge creation UI
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      await graphApi.deleteNode(nodeId);
      setNodes(nodes.filter((n) => n.id !== nodeId));
      setEdges(edges.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    } catch (error) {
      console.error("Failed to delete node:", error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Controls */}
      <aside className="w-64 border-r bg-card overflow-y-auto">
        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("graph")}
              className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === "graph"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              关系图谱
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === "map"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              地图
            </button>
          </div>

          {activeTab === "graph" ? (
            <>
              {/* Add Node Buttons */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">添加节点</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(nodeTypeIcons).map(([type, Icon]) => (
                    <button
                      key={type}
                      onClick={() => handleAddNode(type)}
                      className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {type === "character"
                        ? "人物"
                        : type === "location"
                        ? "地点"
                        : type === "organization"
                        ? "组织"
                        : type === "event"
                        ? "事件"
                        : type === "item"
                        ? "物品"
                        : "线索"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">图例</h3>
                <div className="space-y-1">
                  {Object.entries(nodeTypeColors).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span>
                        {type === "character"
                          ? "人物"
                          : type === "location"
                          ? "地点"
                          : type === "organization"
                          ? "组织"
                          : type === "event"
                          ? "事件"
                          : type === "item"
                          ? "物品"
                          : "线索"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relation Types */}
              <div>
                <h3 className="text-sm font-medium mb-2">关系类型</h3>
                <div className="flex flex-wrap gap-1">
                  {relationTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 text-xs bg-secondary rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Map List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">地图列表</h3>
                  <button className="p-1 rounded hover:bg-accent">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {maps.map((map) => (
                    <button
                      key={map.id}
                      className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{map.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {map.mapType === "world"
                          ? "世界地图"
                          : map.mapType === "city"
                          ? "城市地图"
                          : map.mapType === "route"
                          ? "路线图"
                          : "战场图"}
                      </div>
                    </button>
                  ))}
                  {maps.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      暂无地图
                    </p>
                  )}
                </div>
              </div>

              {/* Map Tools */}
              <div>
                <h3 className="text-sm font-medium mb-2">绘图工具</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 border rounded-md text-sm hover:bg-accent">
                    画笔
                  </button>
                  <button className="px-3 py-2 border rounded-md text-sm hover:bg-accent">
                    区域
                  </button>
                  <button className="px-3 py-2 border rounded-md text-sm hover:bg-accent">
                    路线
                  </button>
                  <button className="px-3 py-2 border rounded-md text-sm hover:bg-accent">
                    标记
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-muted/30">
        {activeTab === "graph" ? (
          <div className="absolute inset-0 p-4">
            {/* Graph Canvas - Placeholder for React Flow */}
            <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">关系图谱</p>
                <p className="text-sm">
                  使用 React Flow 实现交互式图谱
                </p>
                <p className="text-sm mt-2">
                  节点: {nodes.length} | 关系: {edges.length}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 p-4">
            {/* Map Canvas - Placeholder for Excalidraw */}
            <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">地图绘制</p>
                <p className="text-sm">
                  使用 Excalidraw 实现地图绘制
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Details */}
      <aside className="w-72 border-l bg-card overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold mb-4">
            {selectedNode
              ? "节点详情"
              : selectedEdge
              ? "关系详情"
              : "选择节点或关系"}
          </h2>

          {selectedNode && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  名称
                </label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => {
                    // TODO: Update node label
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  类型
                </label>
                <div className="mt-1 px-3 py-2 border rounded-md bg-muted">
                  {selectedNode.nodeType === "character"
                    ? "人物"
                    : selectedNode.nodeType === "location"
                    ? "地点"
                    : selectedNode.nodeType === "organization"
                    ? "组织"
                    : selectedNode.nodeType === "event"
                    ? "事件"
                    : selectedNode.nodeType === "item"
                    ? "物品"
                    : "线索"}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  关联设定
                </label>
                <div className="mt-1 px-3 py-2 border rounded-md bg-muted">
                  {selectedNode.entityId || "未关联"}
                </div>
              </div>

              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-destructive border border-destructive rounded-md hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除节点
              </button>
            </div>
          )}

          {selectedEdge && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  关系类型
                </label>
                <select
                  value={selectedEdge.relationType}
                  onChange={(e) => {
                    // TODO: Update edge relation type
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  {relationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  说明
                </label>
                <textarea
                  value={selectedEdge.description}
                  onChange={(e) => {
                    // TODO: Update edge description
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded-md resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  证据章节
                </label>
                <div className="mt-1 space-y-1">
                  {selectedEdge.evidenceChapterIds.map((chapterId, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      章节 ID: {chapterId}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!selectedNode && !selectedEdge && (
            <div className="text-center text-muted-foreground py-8">
              <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>点击节点或关系查看详情</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
