# AI Novel Studio

面向小说作者的本地优先桌面客户端。

## 技术栈

- **桌面客户端**: Tauri 2
- **前端**: React + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **富文本编辑器**: TipTap / ProseMirror
- **图谱画布**: React Flow
- **地图绘制**: Excalidraw / tldraw
- **状态管理**: Zustand
- **本地服务**: Java 21 + Spring Boot
- **AI 编排**: LangChain4j
- **数据库**: SQLite
- **全文检索**: SQLite FTS5
- **向量检索**: sqlite-vec
- **自动发布**: Playwright

## 项目结构

```
ai-novel-studio/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Java 21 + Spring Boot
├── DESIGN.md          # 设计开发文档
└── README.md
```

## 开发阶段

### 第一阶段：基础写作闭环
- 创建 Tauri + React + Java 项目骨架
- SQLite 初始化和 migration
- 小说、卷、章节 CRUD
- 章节树和 TipTap 编辑器
- 自动保存和版本历史
- 章节锁定

### 第二阶段：设定与 AI
- 设定资料库 CRUD
- 不可改动事实
- 灵感池
- LangChain4j 接入
- 语法纠错、润色、设定冲突检查
- AI 建议 diff 预览和应用

### 第三阶段：图谱与地图
- React Flow 关系图谱
- 图谱节点/边持久化
- Excalidraw/tldraw 地图画布
- 地图标记和设定绑定
- AI 图谱/地图分析

### 第四阶段：发布中心
- 发布站点配置
- 发布排期
- 发布前检查
- Playwright 自动发布
- 发布日志和失败重试

## 快速开始

```bash
# 前端
cd frontend
npm install
npm run dev

# 后端
cd backend
./mvnw spring-boot:run
```

## 许可证

MIT
