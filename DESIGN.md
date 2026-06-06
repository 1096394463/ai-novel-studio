# AI Novel Studio 设计开发文档

版本：v1.0 
生成日期：2026-06-04 
适用对象：产品设计 agent、前端开发 agent、后端开发 agent、AI/RAG 开发 agent、测试 agent 
原型文件：https://www.figma.com/design/LurUa3DqZVo5oZIPcSZC6W

## 0. 原型页面截图

说明：以下截图为根据当前 Figma 原型和新增需求生成的文档内嵌原型图。由于 Figma Starter 计划触发 MCP 调用额度限制，本文档使用本地 SVG 截图作为可交付视觉参考；后续可在额度恢复后替换为 Figma 原始导出的 PNG。

### 0.1 小说管理 / Library

![小说管理原型截图](prototype_screenshots/01_library.svg)

### 0.2 写作工作台 / Editor

![写作工作台原型截图](prototype_screenshots/02_editor.svg)

### 0.3 设定资料库 / World Bible

![设定资料库原型截图](prototype_screenshots/03_world_bible.svg)

### 0.4 发布与 AI 配置 / Publishing

![发布与 AI 配置原型截图](prototype_screenshots/04_publishing.svg)

### 0.5 关系图谱与地图绘制 / Graph and Map

![关系图谱与地图绘制原型截图](prototype_screenshots/05_graph_map.svg)

## 1. 项目概述

AI Novel Studio 是一款面向小说作者的本地优先桌面客户端。它的核心目标不是替作者"自动写小说"，而是帮助作者管理长篇创作中最容易失控的内容：作品、章节、锁定文本、设定、人物关系、灵感、地图、AI 润色、错误检查和小说网站自动发布。

第一版产品应围绕以下能力建设：

- 小说项目管理：作品、卷、章节、字数、状态、封面、标签。
- 写作工作台：章节树、正文编辑、自动保存、章节锁定、局部锁定。
- AI 辅助写作：语法纠错、错别字检查、润色、扩写、缩写、设定冲突检查。
- 设定资料库：人物、地点、组织、物品、事件、时间线、灵感池。
- 关系图谱：人物关系、势力关系、事件因果、伏笔关联。
- 地图绘制：世界地图、城市地图、路线、图层、地点标记。
- 灵感提示：作者随手记录灵感，AI 根据当前剧情发展提示可插入位置。
- 自动发布：按配置接入小说网站，执行发布前检查并自动发布章节。

## 2. 推荐技术栈

推荐采用"桌面壳 + Web 前端 + Java 本地服务"的架构。

| 层级 | 技术 |
|---|---|
| 桌面客户端 | Tauri 2 |
| 前端框架 | React + TypeScript + Vite |
| UI 组件 | shadcn/ui + Tailwind CSS + lucide-react |
| 富文本编辑器 | TipTap / ProseMirror |
| 图谱画布 | React Flow |
| 地图/绘图画布 | Excalidraw 或 tldraw；高级地图可后续接 Konva/Fabric.js |
| 状态管理 | Zustand |
| 本地服务 | Java 21 + Spring Boot |
| AI 编排 | LangChain4j |
| 数据库 | SQLite |
| 全文检索 | SQLite FTS5 |
| 向量检索 | sqlite-vec；后期可替换 Qdrant |
| 自动发布 | Playwright |
| 本地 AI | Ollama，可选 |
| 云端 AI | OpenAI / Claude / Gemini / DeepSeek |

## 3. 总体架构

```text
Tauri Desktop App
 |
 |-- React Frontend
 | |-- 小说管理
 | |-- 写作工作台
 | |-- 设定资料库
 | |-- 关系图谱
 | |-- 地图绘制
 | |-- 发布中心
 | |-- AI 配置
 |
 |-- Java Local Service
 |-- Project / Novel / Chapter Service
 |-- Lock Service
 |-- World Bible Service
 |-- Graph Service
 |-- Map Service
 |-- Idea Service
 |-- AI Orchestration Service
 |-- Publishing Service
 |-- SQLite Repository
 |-- Vector / FTS Retrieval
```

前端通过 Tauri command 或本地 HTTP 与 Java 服务通信。第一版建议 Java 服务以内嵌本地服务形式启动，监听 `127.0.0.1` 随机端口，Tauri 负责生命周期管理。

## 4. 信息架构

主导航包含：

- 书架：作品管理、近期写作、待处理 AI 任务。
- 写作：章节树、正文编辑器、AI 侧栏。
- 设定：人物、地点、组织、物品、时间线、灵感池。
- 图谱：关系图谱、伏笔图谱、势力结构图。
- 地图：世界地图、城市地图、路线、图层。
- 发布：站点配置、发布排期、发布前检查。
- AI：模型配置、上下文范围、默认工作流。

原型中"图谱"和"地图"可先合并为一屏：`设定图谱与世界地图`。后续随着功能扩展，再拆成两个一级页面。

## 5. 原型页面说明

### 5.1 小说管理 / Library

用途：管理所有作品，显示近期写作状态和 AI 待处理事项。

主要区域：

- 左侧导航：书架、写作、设定、大纲、发布、AI。
- 顶部栏：页面标题、搜索、快捷入口、用户头像。
- 当前作品 Hero：作品名、类型、连载状态、总字数、今日字数、AI 伏笔提醒。
- 今日写作卡片：今日目标、完成进度、连续写作天数、自动保存状态。
- 待处理卡片：语法检查、人物称谓一致性、灵感插入建议。
- 作品列表：封面、标题、类型、字数、状态、最近章节、预计发布。

开发要求：

- 作品卡片支持点击进入写作工作台。
- 作品状态至少包括：设定中、草稿、连载中、暂停、已完结、锁定。
- 待处理任务来自 `ai_tasks` 表，可点击进入对应章节或设定项。

### 5.2 写作工作台 / Editor

用途：作者的核心写作界面。

主要区域：

- 左侧章节树：卷、章节、章节字数、选中状态。
- 锁定摘要：显示当前章节锁定范围，解释锁定后 AI 只提供建议。
- 中间正文编辑器：章节标题、正文内容、选中文本高亮。
- 内联 AI 提示：根据选中文本、设定、灵感池给出建议。
- 底部状态栏：本章字数、锁定字数、自动保存时间。
- 右侧 AI 侧栏：纠错、润色、扩写、检查矛盾、提示词输入、上下文命中。

开发要求：

- 富文本编辑器使用 TipTap。
- 正文存储建议使用 JSON 文档结构，同时保存纯文本快照用于全文检索。
- 章节锁定必须是强约束：被锁定文本不允许直接编辑；AI 不能直接覆盖锁定区域。
- AI 修改建议采用"diff 预览 + 作者确认"的方式。
- 支持局部选中文本调用 AI 功能。
- 自动保存节流：输入停止 800ms 后保存；强制每 10 秒保存一次脏数据。

### 5.3 设定资料库 / World Bible

用途：管理小说世界观、人物、地点、组织、物品、时间线、灵感。

主要区域：

- 左侧设定类型导航：人物、地点、组织、物品、时间线、灵感池。
- 中间实体列表：设定卡片摘要。
- 右侧详情：标题、标签、锁定状态、核心设定、不可改动事实。
- 灵感池提示：AI 根据当前章节推荐可插入灵感。

开发要求：

- 所有设定项都支持标签、别名、锁定、备注、关联章节。
- "不可改动事实"应单独建模，用于 AI 设定一致性检查。
- 设定项应进入全文索引和向量索引。
- 灵感可以处于：未使用、建议插入、已插入、废弃。

### 5.4 关系图谱与地图绘制 / Graph and Map

用途：补充原型中的新增需求，用图结构和绘图能力管理复杂设定。

关系图谱区域：

- 节点：人物、组织、地点、事件、物品、伏笔。
- 边：旧识、亲属、敌对、同盟、师徒、恋人、利用、隐瞒、因果、拥有、出现于。
- 图例：不同关系类型用不同颜色表示。
- 选中关系详情：展示关系类型、证据章节、备注、AI 提醒。
- AI 图谱提示：检测人物关系矛盾、伏笔遗漏、事件因果不完整。

地图绘制区域：

- 画布：绘制大陆、海洋、山脉、河流、城市、路线。
- 工具：画笔、区域、路线、文本、标记、橡皮、选择。
- 图层：地形、城市、路线、势力范围、事件标记、章节路线。
- 地点绑定：地图上的点可绑定地点设定卡。
- 路线绑定：路线可绑定章节、事件、人物移动记录。

开发要求：

- 关系图谱建议用 React Flow。
- 图谱节点和边必须持久化到数据库，不只保存画布 JSON。
- 地图绘制第一版可使用 Excalidraw 或 tldraw 保存场景 JSON。
- 地图上的地点、路线、区域需要和设定实体建立关联。
- AI 检索时应能读取图谱关系和地图关系，例如"沈砚从旧港到灯塔经过哪些区域"。

### 5.5 发布与 AI 配置 / Publishing

用途：管理小说网站接入、发布排期、发布前检查、AI 默认策略。

主要区域：

- 发布排期：待发布章节、时间、站点、状态。
- 平台格式预览：标题、正文格式、作者话、敏感词风险。
- 小说网站接入：起点、晋江、番茄等站点账号配置。
- 发布前检查：敏感词扫描、错别字检查、章节锁定确认、平台格式转换。
- AI 配置：模型、默认工作流、上下文范围。

开发要求：

- 第一版只需要支持一个站点，其他站点保留配置入口。
- 自动发布使用 Playwright，必须支持人工介入验证码。
- 发布前必须生成检查报告。
- 发布动作必须写入日志，包含时间、站点、章节、结果、错误信息。

## 6. 核心业务规则

### 6.1 小说与章节

- 一个作品包含多个卷。
- 一个卷包含多个章节。
- 章节支持排序、拖拽、归档、锁定、发布状态。
- 章节正文必须有版本历史。
- 删除章节进入回收站，不立即物理删除。

### 6.2 锁定规则

- 作品锁定：作品整体只读，不能编辑章节和设定。
- 章节锁定：章节全文只读，但允许创建 AI 建议。
- 局部锁定：章节中某个文本范围不可编辑。
- 设定锁定：人物关键事实不可被 AI 自动修改。
- AI 对锁定内容只能提出建议，不能直接覆盖。

### 6.3 AI 建议规则

- 所有 AI 生成内容必须标记来源和时间。
- AI 修改正文必须通过作者确认。
- AI 建议需要保留原文、建议文、操作类型、模型名。
- AI 检查设定冲突时应引用相关设定和章节。

### 6.4 灵感插入规则

- 灵感可随时记录，不要求结构完整。
- 灵感可以绑定人物、地点、章节、图谱节点。
- AI 根据当前章节内容、最近剧情、设定图谱，推荐可插入灵感。
- 作者确认插入后，灵感状态改为"已插入"，并记录插入章节和段落。

## 7. 数据模型

以下为第一版建议表结构。字段类型以 SQLite 为准。

### 7.1 novels

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| title | text | 作品名 |
| genre | text | 类型 |
| status | text | 状态 |
| synopsis | text | 简介 |
| cover_path | text | 封面 |
| total_words | integer | 总字数 |
| target_daily_words | integer | 每日目标 |
| locked | integer | 是否锁定 |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

### 7.2 volumes

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| novel_id | text | 所属作品 |
| title | text | 卷名 |
| sort_order | integer | 排序 |
| synopsis | text | 卷简介 |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

### 7.3 chapters

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| novel_id | text | 所属作品 |
| volume_id | text | 所属卷 |
| title | text | 章节名 |
| sort_order | integer | 排序 |
| content_json | text | TipTap JSON |
| content_text | text | 纯文本 |
| word_count | integer | 字数 |
| status | text | draft / ready / published / archived |
| locked | integer | 是否全文锁定 |
| locked_until_offset | integer | 锁定到纯文本 offset |
| last_saved_at | text | 最后保存 |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

### 7.4 chapter_versions

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| chapter_id | text | 章节 |
| content_json | text | 历史正文 |
| content_text | text | 历史纯文本 |
| word_count | integer | 字数 |
| reason | text | auto_save / manual / ai_apply |
| created_at | text | 创建时间 |

### 7.5 world_entities

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| novel_id | text | 所属作品 |
| type | text | character / location / organization / item / event / timeline |
| name | text | 名称 |
| aliases | text | JSON 数组 |
| summary | text | 摘要 |
| detail_json | text | 结构化详情 |
| locked | integer | 是否锁定 |
| tags | text | JSON 数组 |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

### 7.6 immutable_facts

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| entity_id | text | 设定实体 |
| fact | text | 不可改动事实 |
| source_chapter_id | text | 来源章节，可空 |
| importance | integer | 重要度 1-5 |
| created_at | text | 创建时间 |

### 7.7 ideas

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| novel_id | text | 所属作品 |
| title | text | 灵感标题 |
| content | text | 内容 |
| status | text | unused / suggested / inserted / discarded |
| tags | text | JSON 数组 |
| related_entity_ids | text | JSON 数组 |
| suggested_chapter_id | text | AI 建议章节 |
| inserted_chapter_id | text | 实际插入章节 |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

### 7.8 graph_nodes

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| novel_id | text | 所属作品 |
| entity_id | text | 关联设定实体，可空 |
| node_type | text | character / location / organization / event / item / clue |
| label | text | 显示名称 |
| x | real | 画布 X |
| y | real | 画布 Y |
| style_json | text | 节点样式 |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

### 7.9 graph_edges

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| novel_id | text | 所属作品 |
| source_node_id | text | 起点 |
| target_node_id | text | 终点 |
| relation_type | text | 关系类型 |
| label | text | 显示标签 |
| description | text | 关系说明 |
| evidence_chapter_ids | text | JSON 数组 |
| style_json | text | 边样式 |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

### 7.10 maps

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| novel_id | text | 所属作品 |
| title | text | 地图名 |
| map_type | text | world / city / route / battle |
| scene_json | text | 绘图场景 JSON |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

### 7.11 map_markers

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| map_id | text | 地图 |
| entity_id | text | 绑定设定实体 |
| marker_type | text | city / place / route / region / event |
| label | text | 标记名 |
| x | real | X |
| y | real | Y |
| metadata_json | text | 附加信息 |

### 7.12 ai_tasks

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| novel_id | text | 所属作品 |
| target_type | text | chapter / entity / graph / map |
| target_id | text | 目标 ID |
| task_type | text | grammar / polish / consistency / idea_suggestion |
| status | text | pending / running / done / failed |
| result_json | text | 结果 |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

### 7.13 publish_sites

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| name | text | 站点名 |
| type | text | qidian / jjwxc / fanqie / custom |
| config_json | text | 站点配置 |
| enabled | integer | 是否启用 |
| created_at | text | 创建时间 |

### 7.14 publish_jobs

| 字段 | 类型 | 说明 |
|---|---|---|
| id | text pk | UUID |
| novel_id | text | 所属作品 |
| chapter_id | text | 章节 |
| site_id | text | 站点 |
| scheduled_at | text | 计划时间 |
| status | text | scheduled / checking / publishing / published / failed |
| check_report_json | text | 发布前检查 |
| publish_log | text | 发布日志 |
| created_at | text | 创建时间 |
| updated_at | text | 更新时间 |

## 8. API 设计

第一版可以采用本地 REST API，也可以由 Tauri command 转发。以下以 REST 表达。

### 8.1 小说

- `GET /api/novels`
- `POST /api/novels`
- `GET /api/novels/{id}`
- `PATCH /api/novels/{id}`
- `POST /api/novels/{id}/lock`
- `POST /api/novels/{id}/unlock`

### 8.2 章节

- `GET /api/novels/{novelId}/chapters`
- `POST /api/novels/{novelId}/chapters`
- `GET /api/chapters/{id}`
- `PATCH /api/chapters/{id}`
- `POST /api/chapters/{id}/save`
- `POST /api/chapters/{id}/lock`
- `POST /api/chapters/{id}/unlock`
- `GET /api/chapters/{id}/versions`
- `POST /api/chapters/{id}/restore-version/{versionId}`

### 8.3 设定

- `GET /api/novels/{novelId}/entities?type=character`
- `POST /api/novels/{novelId}/entities`
- `GET /api/entities/{id}`
- `PATCH /api/entities/{id}`
- `POST /api/entities/{id}/facts`
- `DELETE /api/entities/{id}/facts/{factId}`

### 8.4 灵感

- `GET /api/novels/{novelId}/ideas`
- `POST /api/novels/{novelId}/ideas`
- `PATCH /api/ideas/{id}`
- `POST /api/ideas/{id}/mark-inserted`
- `GET /api/chapters/{chapterId}/idea-suggestions`

### 8.5 图谱

- `GET /api/novels/{novelId}/graph`
- `POST /api/novels/{novelId}/graph/nodes`
- `PATCH /api/graph/nodes/{id}`
- `DELETE /api/graph/nodes/{id}`
- `POST /api/novels/{novelId}/graph/edges`
- `PATCH /api/graph/edges/{id}`
- `DELETE /api/graph/edges/{id}`
- `POST /api/novels/{novelId}/graph/analyze`

### 8.6 地图

- `GET /api/novels/{novelId}/maps`
- `POST /api/novels/{novelId}/maps`
- `GET /api/maps/{id}`
- `PATCH /api/maps/{id}`
- `POST /api/maps/{id}/markers`
- `PATCH /api/maps/{id}/markers/{markerId}`
- `DELETE /api/maps/{id}/markers/{markerId}`

### 8.7 AI

- `POST /api/ai/grammar-check`
- `POST /api/ai/polish`
- `POST /api/ai/expand`
- `POST /api/ai/consistency-check`
- `POST /api/ai/idea-suggestions`
- `POST /api/ai/graph-analysis`
- `POST /api/ai/map-analysis`

### 8.8 发布

- `GET /api/publish/sites`
- `POST /api/publish/sites`
- `PATCH /api/publish/sites/{id}`
- `GET /api/publish/jobs`
- `POST /api/publish/jobs`
- `POST /api/publish/jobs/{id}/precheck`
- `POST /api/publish/jobs/{id}/publish`
- `GET /api/publish/jobs/{id}/logs`

## 9. AI 工作流

### 9.1 上下文构建

AI 每次执行任务时，后端需要组装上下文：

- 当前章节选中文本。
- 当前章节前后段落。
- 最近 3-6 章摘要。
- 相关人物、地点、组织、物品设定。
- 不可改动事实。
- 相关图谱节点和边。
- 相关地图地点和路线。
- 未使用或建议插入的灵感。

上下文构建方式：

1. 使用关键词和实体名称做 SQLite FTS 检索。
2. 使用 embedding 做向量检索。
3. 将图谱关系作为结构化上下文注入 prompt。
4. 将地图地点、路线作为结构化上下文注入 prompt。

### 9.2 语法纠错

输入：选中文本或整章。 
输出：错误列表、修改建议、修改后文本。 
要求：不能改变剧情信息；不能修改锁定文本。

### 9.3 润色

输入：选中文本、润色风格、上下文。 
输出：1-3 个润色版本。 
要求：保留作者原意；标记改动点；作者确认后应用。

### 9.4 设定冲突检查

输入：章节正文、相关设定、不可改动事实、图谱。 
输出：

- 冲突位置。
- 冲突说明。
- 引用的设定或章节。
- 修复建议。

### 9.5 灵感插入建议

输入：当前章节摘要、剧情阶段、未使用灵感、设定图谱。 
输出：

- 推荐灵感。
- 建议插入位置。
- 插入理由。
- 风险提示。

### 9.6 图谱分析

输入：graph_nodes、graph_edges、章节摘要。 
输出：

- 人物关系矛盾。
- 未解释的敌对/同盟关系。
- 可回收伏笔。
- 可新增关系建议。

### 9.7 地图分析

输入：地图标记、路线、章节移动记录。 
输出：

- 路线是否合理。
- 地点是否前后矛盾。
- 角色是否短时间跨越过远距离。
- 某地气候、势力、事件是否缺少设定。

## 10. 前端组件拆分

建议目录：

```text
src/
 app/
 features/
 novels/
 NovelLibraryPage.tsx
 NovelCard.tsx
 DailyGoalCard.tsx
 editor/
 EditorPage.tsx
 ChapterTree.tsx
 WritingEditor.tsx
 LockSummary.tsx
 AiSidePanel.tsx
 InlineAiSuggestion.tsx
 world/
 WorldBiblePage.tsx
 EntityTypeNav.tsx
 EntityList.tsx
 EntityDetail.tsx
 ImmutableFacts.tsx
 IdeaSuggestionPanel.tsx
 graph/
 GraphMapPage.tsx
 RelationshipGraph.tsx
 GraphToolbar.tsx
 GraphDetailPanel.tsx
 maps/
 WorldMapCanvas.tsx
 MapToolbar.tsx
 MapLayerPanel.tsx
 MapMarkerInspector.tsx
 publishing/
 PublishingPage.tsx
 PublishSchedule.tsx
 SiteConfigList.tsx
 PublishPrecheck.tsx
 AiConfigPanel.tsx
 shared/
 api/
 components/
 stores/
 types/
```

## 11. 后端模块拆分

建议包结构：

```text
com.example.novelstudio
 novel
 NovelController
 NovelService
 NovelRepository
 chapter
 ChapterController
 ChapterService
 ChapterVersionService
 lock
 LockService
 world
 WorldEntityController
 WorldEntityService
 ImmutableFactService
 idea
 IdeaController
 IdeaService
 graph
 GraphController
 GraphService
 map
 MapController
 MapService
 ai
 AiController
 AiOrchestrationService
 PromptBuilder
 RetrievalService
 publishing
 PublishController
 PublishService
 PlaywrightPublisher
```

## 12. MVP 开发顺序

第一阶段：基础写作闭环

1. 创建 Tauri + React + Java 项目骨架。
2. SQLite 初始化和 migration。
3. 小说、卷、章节 CRUD。
4. 章节树和 TipTap 编辑器。
5. 自动保存和版本历史。
6. 章节锁定。

第二阶段：设定与 AI

1. 设定资料库 CRUD。
2. 不可改动事实。
3. 灵感池。
4. LangChain4j 接入。
5. 语法纠错、润色、设定冲突检查。
6. AI 建议 diff 预览和应用。

第三阶段：图谱与地图

1. React Flow 关系图谱。
2. 图谱节点/边持久化。
3. Excalidraw/tldraw 地图画布。
4. 地图标记和设定绑定。
5. AI 图谱/地图分析。

第四阶段：发布中心

1. 发布站点配置。
2. 发布排期。
3. 发布前检查。
4. Playwright 自动发布。
5. 发布日志和失败重试。

## 13. 验收标准

MVP 可验收条件：

- 用户可以创建作品、卷、章节。
- 用户可以在写作工作台编辑正文并自动保存。
- 用户可以锁定章节或局部文本。
- 用户可以创建人物、地点、组织、物品、灵感。
- AI 可以对选中文本执行纠错和润色。
- AI 可以基于设定指出至少一种冲突。
- 用户可以创建人物关系图，保存节点和边。
- 用户可以创建地图，保存地图场景和地点标记。
- 用户可以创建发布任务并执行发布前检查。

## 14. 关键风险

- 自动发布涉及各小说网站规则变化，需要插件化站点适配。
- AI 不能直接覆盖锁定内容，否则会破坏作者信任。
- 长篇小说上下文很大，必须做检索和摘要，不能每次全量塞 prompt。
- 图谱和地图不能只是视觉画布，必须与设定实体绑定。
- 本地数据必须提供备份和导出，否则作者不敢长期使用。

## 15. 下一步建议

优先实现"写作工作台 + 设定资料库 + AI 润色/纠错"的 MVP。图谱和地图可以在数据模型上先留好接口，前端第二阶段接入 React Flow 和 Excalidraw/tldraw。
