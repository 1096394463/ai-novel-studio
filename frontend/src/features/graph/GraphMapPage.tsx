import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
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
  X,
  Save,
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

// Custom node component
const CustomNode = ({ data }: { data: any }) => {
  const Icon = nodeTypeIcons[data.nodeType] || Users;
  const color = nodeTypeColors[data.nodeType] || "#6b7280";

  return (
    <div
      className="px-4 py-2 shadow-md rounded-md border-2 bg-background"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2">
        <div
          className="p-1 rounded-full"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="font-medium text-sm">{data.label}</div>
      </div>
      {data.entityName && (
        <div className="text-xs text-muted-foreground mt-1">
          {data.entityName}
        </div>
      )}
    </div>
  );
};

// Custom edge component
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
}: any) => {
  const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={style}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: 12 }}
          startOffset="50%"
          textAnchor="middle"
        >
          {data?.label || ""}
        </textPath>
      </text>
    </>
  );
};

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

export function GraphMapPage() {
  const { novelId } = useParams<{ novelId: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "map">("graph");
  const [showNewNode, setShowNewNode] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeType, setNewNodeType] = useState<string>("character");
  const [showNewEdge, setShowNewEdge] = useState(false);
  const [newEdgeSource, setNewEdgeSource] = useState("");
  const [newEdgeTarget, setNewEdgeTarget] = useState("");
  const [newEdgeType, setNewEdgeType] = useState(relationTypes[0]);
  const [error, setError] = useState<string | null>(null);
  const [showNewMap, setShowNewMap] = useState(false);
  const [newMapTitle, setNewMapTitle] = useState("");
  const [newMapType, setNewMapType] = useState("world");

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
      setError(null);

      // Convert to React Flow format
      const flowNodes: Node[] = data.nodes.map((node) => ({
        id: node.id,
        type: "custom",
        position: { x: node.x, y: node.y },
        data: {
          label: node.label,
          nodeType: node.nodeType,
          entityId: node.entityId,
        },
      }));

      const flowEdges: Edge[] = data.edges.map((edge) => ({
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        type: "custom",
        data: {
          label: edge.label,
          relationType: edge.relationType,
          description: edge.description,
        },
        animated: true,
        style: { stroke: "#6b7280" },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      setError(error.message || "加载图谱失败");
    }
  };

  const loadMaps = async () => {
    if (!novelId) return;
    try {
      const data = await mapApi.list(novelId);
      setMaps(data);
    } catch (error) {
      setError(error.message || "加载地图失败");
    }
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Find the original graph node
      setSelectedNode({
        id: node.id,
        novelId: novelId || "",
        nodeType: node.data.nodeType,
        label: node.data.label,
        x: node.position.x,
        y: node.position.y,
        entityId: node.data.entityId,
        styleJson: {},
        createdAt: "",
        updatedAt: "",
      });
      setSelectedEdge(null);
    },
    [novelId]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge({
        id: edge.id,
        novelId: novelId || "",
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        relationType: edge.data?.relationType || "",
        label: edge.data?.label || "",
        description: edge.data?.description || "",
        evidenceChapterIds: [],
        styleJson: {},
        createdAt: "",
        updatedAt: "",
      });
      setSelectedNode(null);
    },
    [novelId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const handleAddNode = async () => {
    if (!novelId || !newNodeLabel.trim()) return;
    try {
      const node = await graphApi.createNode(novelId, {
        nodeType: newNodeType as GraphNode["nodeType"],
        label: newNodeLabel.trim(),
        x: Math.random() * 500,
        y: Math.random() * 300,
        styleJson: JSON.stringify({ color: nodeTypeColors[newNodeType] }),
      });

      setNodes((nds) => [
        ...nds,
        {
          id: node.id,
          type: "custom",
          position: { x: node.x, y: node.y },
          data: {
            label: node.label,
            nodeType: node.nodeType,
            entityId: node.entityId,
          },
        },
      ]);

      setNewNodeLabel("");
      setShowNewNode(false);
    } catch (error) {
      setError(error.message || "添加节点失败");
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!nodeId) return;
    try {
      await graphApi.deleteNode(nodeId);
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      setSelectedNode(null);
    } catch (error: any) {
      setError(error.message || "删除节点失败");
    }
  };

  const handleUpdateNodePosition = async (nodeId: string, position: { x: number; y: number }) => {
    try {
      await graphApi.updateNode(nodeId, {
        x: position.x,
        y: position.y,
      });
    } catch (error) {
      setError(error.message || "更新位置失败");
    }
  };

  const handleAddEdge = async () => {
    if (!novelId || !newEdgeSource || !newEdgeTarget) return;
    try {
      const edge = await graphApi.createEdge(novelId, {
        sourceNodeId: newEdgeSource,
        targetNodeId: newEdgeTarget,
        relationType: newEdgeType,
        label: newEdgeType,
        description: "",
        evidenceChapterIds: [],
        styleJson: JSON.stringify({}),
      });

      setEdges((eds) => [
        ...eds,
        {
          id: edge.id,
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          type: "custom",
          data: {
            label: edge.label,
            relationType: edge.relationType,
            description: edge.description,
          },
          animated: true,
          style: { stroke: "#6b7280" },
        },
      ]);

      setShowNewEdge(false);
      setNewEdgeSource("");
      setNewEdgeTarget("");
    } catch (error) {
      setError(error.message || "添加关系失败");
    }
  };

  const handleDeleteEdge = async (edgeId: string) => {
    try {
      await graphApi.deleteEdge(edgeId);
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      setSelectedEdge(null);
    } catch (error) {
      setError(error.message || "删除关系失败");
    }
  };

  const handleNodeDragStop = async (_: React.MouseEvent, node: Node) => {
    await handleUpdateNodePosition(node.id, node.position);
  };

  const handleCreateMap = async () => {
    if (!novelId || !newMapTitle.trim()) return;
    try {
      const m = await mapApi.create(novelId, { title: newMapTitle.trim(), mapType: newMapType });
      setMaps([...maps, m]);
      setNewMapTitle("");
      setShowNewMap(false);
    } catch (error: any) {
      setError(error.message || "创建地图失败");
    }
  };

  // Node type options for dropdown
  const nodeTypeOptions = Object.entries(nodeTypeIcons).map(([type, Icon]) => ({
    value: type,
    label:
      type === "character"
        ? "人物"
        : type === "location"
        ? "地点"
        : type === "organization"
        ? "组织"
        : type === "event"
        ? "事件"
        : type === "item"
        ? "物品"
        : "线索",
    icon: Icon,
    color: nodeTypeColors[type],
  }));

  return (
    <div className="flex h-full">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:opacity-80">✕</button>
        </div>
      )}

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
              {/* Add Node */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">添加节点</h3>
                  <button
                    onClick={() => setShowNewNode(true)}
                    className="p-1 rounded hover:bg-accent"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showNewNode && (
                  <div className="p-3 border rounded-md mb-3">
                    <select
                      value={newNodeType}
                      onChange={(e) => setNewNodeType(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                    >
                      {nodeTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newNodeLabel}
                      onChange={(e) => setNewNodeLabel(e.target.value)}
                      placeholder="节点名称"
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddNode();
                        if (e.key === "Escape") setShowNewNode(false);
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddNode}
                        className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
                      >
                        创建
                      </button>
                      <button
                        onClick={() => setShowNewNode(false)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Edge */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">添加关系</h3>
                  <button
                    onClick={() => setShowNewEdge(true)}
                    className="p-1 rounded hover:bg-accent"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                {showNewEdge && (
                  <div className="p-3 border rounded-md mb-3">
                    <select
                      value={newEdgeSource}
                      onChange={(e) => setNewEdgeSource(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                    >
                      <option value="">选择起点</option>
                      {nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.data.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newEdgeTarget}
                      onChange={(e) => setNewEdgeTarget(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                    >
                      <option value="">选择终点</option>
                      {nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.data.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newEdgeType}
                      onChange={(e) => setNewEdgeType(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                    >
                      {relationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddEdge}
                        className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
                      >
                        创建
                      </button>
                      <button
                        onClick={() => setShowNewEdge(false)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">图例</h3>
                <div className="space-y-1">
                  {Object.entries(nodeTypeColors).map(([type, color]) => {
                    const Icon = nodeTypeIcons[type] || Users;
                    return (
                      <div
                        key={type}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <Icon className="w-3 h-3" style={{ color }} />
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
                    );
                  })}
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

              {/* Stats */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  节点: {nodes.length} | 关系: {edges.length}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Map List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">地图列表</h3>
                  <button onClick={() => setShowNewMap(true)} className="p-1 rounded hover:bg-accent">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showNewMap && (
                  <div className="p-3 border rounded-md mb-3">
                    <input
                      type="text"
                      value={newMapTitle}
                      onChange={(e) => setNewMapTitle(e.target.value)}
                      placeholder="地图名称"
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateMap(); if (e.key === "Escape") setShowNewMap(false); }}
                    />
                    <select
                      value={newMapType}
                      onChange={(e) => setNewMapType(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                    >
                      <option value="world">世界地图</option>
                      <option value="city">城市地图</option>
                      <option value="route">路线图</option>
                      <option value="battle">战场图</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleCreateMap} className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded">创建</button>
                      <button onClick={() => setShowNewMap(false)} className="flex-1 px-2 py-1 text-xs border rounded">取消</button>
                    </div>
                  </div>
                )}

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
      <div className="flex-1 relative">
        {activeTab === "graph" ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodeDragStop={handleNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
            <Background gap={16} size={1} />
          </ReactFlow>
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
                <p className="text-sm mt-2">
                  地图数量: {maps.length}
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
                <div
                  className="mt-1 px-3 py-2 border rounded-md flex items-center gap-2"
                  style={{
                    borderColor: nodeTypeColors[selectedNode.nodeType],
                  }}
                >
                  {(() => {
                    const Icon = nodeTypeIcons[selectedNode.nodeType] || Users;
                    return <Icon className="w-4 h-4" style={{ color: nodeTypeColors[selectedNode.nodeType] }} />;
                  })()}
                  <span>
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
                  </span>
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

              <button
                onClick={() => handleDeleteEdge(selectedEdge.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-destructive border border-destructive rounded-md hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除关系
              </button>
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
