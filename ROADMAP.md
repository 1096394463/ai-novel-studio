# AI Novel Studio 迭代规划 & 备份服务方案

版本：v2.0
更新日期：2026-06-07

---

## 一、项目总览

### 产品定位

AI Novel Studio 是一款面向小说作者的**本地优先**桌面客户端，配合云端备份服务实现多设备数据同步。

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    桌面客户端 (Tauri 2)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  React 前端   │  │  TipTap 编辑器 │  │  React Flow  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│  ┌──────┴─────────────────┴─────────────────┴───────┐  │
│  │           本地后端 (Spring Boot, 随 app 启动)       │  │
│  │           SQLite · FTS5 · 向量检索                  │  │
│  └──────────────────────┬───────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                备份服务端 (云端 / 自建)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  用户管理     │  │  备份存储     │  │  设备管理     │  │
│  │  JWT 认证     │  │  多版本历史   │  │  在线状态     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  数据库：PostgreSQL / MySQL                             │
└─────────────────────────────────────────────────────────┘
```

### 技术栈汇总

| 层级 | 技术 | 说明 |
|------|------|------|
| 桌面客户端 | Tauri 2 | 桌面壳，管理本地后端生命周期 |
| 前端 | React + TypeScript + Vite + shadcn/ui + Tailwind CSS | UI 框架 |
| 富文本编辑器 | TipTap / ProseMirror | 小说正文编辑 |
| 图谱画布 | React Flow | 人物关系图 |
| 地图绘制 | Excalidraw / tldraw | 世界地图 |
| 状态管理 | Zustand | 客户端状态 |
| 本地后端 | Java 21 + Spring Boot 3.3 | 随桌面端自动启停 |
| AI 编排 | LangChain4j | 语法纠错、润色、冲突检查 |
| 本地数据库 | SQLite + FTS5 + sqlite-vec | 全文+向量检索 |
| 备份服务端 | Java 21 + Spring Boot 3.3 | 独立部署，用户管理+备份 |
| 服务端数据库 | PostgreSQL | 用户、备份元数据 |
| 备份文件存储 | 本地文件系统 / S3 / MinIO | JSON 备份包 |
| 认证 | JWT + bcrypt | 无状态 Token 认证 |
| 自动发布 | Playwright | 小说网站自动发布 |

---

## 二、小说客户端迭代计划

### ✅ 第零阶段：骨架（已完成）

- [x] Tauri 2 + React + Spring Boot 项目骨架
- [x] 数据模型定义（Novel, Volume, Chapter, WorldEntity 等 14 张表）
- [x] 后端 CRUD 服务 + 控制器（42 个 Java 文件）
- [x] 前端页面骨架（Library, Editor, WorldBible, GraphMap, Publishing）
- [x] TipTap 编辑器 + React Flow 图谱
- [x] Tauri sidecar 自动启停 Java 后端
- [x] GitHub Actions 自动构建（Windows/macOS/Linux）+ JRE 打包

### 🔨 第一阶段：基础写作闭环

**目标**：用户可以创建作品、写章节、自动保存、锁定

| # | 功能 | 说明 | 状态 |
|---|------|------|------|
| 1.1 | SQLite 初始化 + migration | 建表、索引、FTS5 虚拟表 | ⬜ |
| 1.2 | 小说 CRUD | 创建、编辑、删除、列表 | ⬜ |
| 1.3 | 卷 CRUD | 创建、排序、删除 | ⬜ |
| 1.4 | 章节 CRUD | 创建、编辑、删除、拖拽排序 | ⬜ |
| 1.5 | TipTap 编辑器完善 | 标题+正文、工具栏、快捷键 | ⬜ |
| 1.6 | 自动保存 | 停止输入 800ms 后保存，每 10s 强制保存 | ⬜ |
| 1.7 | 版本历史 | 每次保存生成版本，支持查看和恢复 | ⬜ |
| 1.8 | 章节锁定 | 全文锁定 + 局部锁定（文本范围） | ⬜ |
| 1.9 | 字数统计 | 实时统计，每日目标追踪 | ⬜ |

**预计工期**：2 周

### 🤖 第二阶段：设定与 AI

**目标**：管理世界观设定，AI 辅助写作

| # | 功能 | 说明 | 状态 |
|---|------|------|------|
| 2.1 | 设定 CRUD | 人物、地点、组织、物品、事件、时间线 | ⬜ |
| 2.2 | 不可改动事实 | 关键设定锁定，AI 检查冲突 | ⬜ |
| 2.3 | 灵感池 | 随手记录，状态管理（未使用/已插入/废弃） | ⬜ |
| 2.4 | LangChain4j 接入 | 配置 API Key，上下文构建 | ⬜ |
| 2.5 | 语法纠错 | 选中文本或整章检查 | ⬜ |
| 2.6 | 润色 | 1-3 个版本，diff 预览+确认 | ⬜ |
| 2.7 | 设定冲突检查 | 引用相关设定和章节 | ⬜ |
| 2.8 | 灵感插入建议 | AI 推荐可插入位置 | ⬜ |

**预计工期**：2 周

### 🗺️ 第三阶段：图谱与地图

**目标**：可视化管理复杂设定关系

| # | 功能 | 说明 | 状态 |
|---|------|------|------|
| 3.1 | React Flow 图谱 | 节点/边 CRUD、拖拽布局 | ⬜ |
| 3.2 | 图谱持久化 | 节点/边存入数据库 | ⬜ |
| 3.3 | 设定绑定 | 图谱节点关联设定实体 | ⬜ |
| 3.4 | 地图画布 | Excalidraw/tldraw 集成 | ⬜ |
| 3.5 | 地图标记 | 标记绑定地点设定 | ⬜ |
| 3.6 | AI 图谱分析 | 关系矛盾、伏笔遗漏检测 | ⬜ |
| 3.7 | AI 地图分析 | 路线合理性、距离矛盾检测 | ⬜ |

**预计工期**：2 周

### 📤 第四阶段：发布中心

**目标**：自动发布到小说网站

| # | 功能 | 说明 | 状态 |
|---|------|------|------|
| 4.1 | 发布站点配置 | 起点、晋江、番茄等 | ⬜ |
| 4.2 | 发布排期 | 计划发布时间、章节选择 | ⬜ |
| 4.3 | 发布前检查 | 敏感词、错别字、格式检查 | ⬜ |
| 4.4 | Playwright 自动发布 | 登录、填表、提交 | ⬜ |
| 4.5 | 发布日志 | 成功/失败记录、重试 | ⬜ |

**预计工期**：2 周

---

## 三、备份服务端方案

### 3.1 服务定位

备份服务端是独立部署的云端服务，负责：
- 用户注册、登录、Token 认证
- 多设备绑定
- 小说数据备份存储（多版本）
- 备份恢复（覆盖/合并）

**离线优先**：客户端不联网也能正常使用所有功能，只有备份/恢复需要联网登录。

### 3.2 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 框架 | Java 21 + Spring Boot 3.3 | 与客户端后端统一技术栈 |
| 数据库 | PostgreSQL 16 | 用户、设备、备份元数据 |
| 文件存储 | 本地文件系统（可扩展到 S3/MinIO） | JSON 备份包 |
| 认证 | JWT（access + refresh token） | 无状态，支持多设备 |
| 密码加密 | bcrypt | Spring Security Crypto |
| API 文档 | SpringDoc OpenAPI (Swagger) | 自动生成 |
| 部署 | Docker + Docker Compose | 一键部署 |
| 反向代理 | Nginx | HTTPS + 限流 |

### 3.3 数据模型

#### users 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 用户 ID |
| username | varchar(50) unique | 用户名 |
| email | varchar(100) unique | 邮箱 |
| password_hash | varchar(100) | bcrypt 密码哈希 |
| nickname | varchar(50) | 昵称 |
| storage_quota_mb | integer | 存储配额（默认 500MB） |
| storage_used_bytes | bigint | 已用存储 |
| created_at | timestamp | 注册时间 |
| updated_at | timestamp | 更新时间 |

#### devices 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 设备 ID |
| user_id | uuid FK | 所属用户 |
| device_name | varchar(100) | 设备名称（如 "我的笔记本"） |
| device_type | varchar(20) | windows / macos / linux |
| last_seen_at | timestamp | 最后在线时间 |
| last_backup_at | timestamp | 最后备份时间 |
| created_at | timestamp | 绑定时间 |

#### backups 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 备份 ID |
| user_id | uuid FK | 所属用户 |
| device_id | uuid FK | 来源设备 |
| version | integer | 版本号（自增） |
| file_path | varchar(500) | 备份文件路径 |
| file_size_bytes | bigint | 文件大小 |
| novel_count | integer | 包含作品数 |
| chapter_count | integer | 包含章节数 |
| total_words | bigint | 总字数 |
| checksum | varchar(64) | SHA-256 校验 |
| created_at | timestamp | 备份时间 |

### 3.4 API 设计

#### 认证

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/auth/register` | POST | 注册 | ❌ |
| `/api/auth/login` | POST | 登录，返回 JWT | ❌ |
| `/api/auth/refresh` | POST | 刷新 token | ✅ |
| `/api/auth/logout` | POST | 注销（token 加入黑名单） | ✅ |
| `/api/auth/me` | GET | 当前用户信息 | ✅ |

#### 设备管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/devices` | GET | 设备列表 |
| `/api/devices` | POST | 注册新设备 |
| `/api/devices/{id}` | DELETE | 移除设备 |

#### 备份操作

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/backup` | POST | 上传备份（multipart/form-data） |
| `/api/backup/latest` | GET | 获取最新备份 |
| `/api/backup/history` | GET | 备份历史（分页） |
| `/api/backup/{id}` | GET | 下载指定版本备份 |
| `/api/backup/{id}` | DELETE | 删除指定版本 |
| `/api/backup/{id}/meta` | GET | 备份元数据（不含文件） |
| `/api/backup/compare` | POST | 比较两个版本差异 |

#### 统计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/stats` | GET | 存储使用、备份次数、最后备份时间 |

### 3.5 客户端集成

#### UI 新增

- **设置页 → 账号**：注册/登录/退出
- **设置页 → 备份**：手动备份、恢复、自动备份开关、备份历史
- **状态栏**：备份状态图标（已同步 / 同步中 / 未登录）

#### 自动备份策略

- 每 30 分钟检查一次
- 仅在本地数据有变更时触发
- 后台静默上传，不打断写作
- 保留最近 30 个版本

#### 恢复策略

- **覆盖恢复**：下载备份 → 清空本地 SQLite → 导入数据
- **智能合并**：按 `updatedAt` 时间戳取最新记录（后续迭代）

### 3.6 安全设计

- 密码 bcrypt 加盐哈希，永不明文存储
- JWT access token 有效期 2 小时，refresh token 7 天
- 备份文件 AES-256 加密存储（可选）
- API 限流：登录 5 次/分钟，备份 10 次/小时
- HTTPS 强制

### 3.7 部署方案

#### Docker Compose 一键部署

```yaml
version: '3.8'
services:
  backup-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: novelstudio
      POSTGRES_USER: novelstudio
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  backup-server:
    build: ./backup-server
    ports:
      - "8443:8443"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://backup-db:5432/novelstudio
      JWT_SECRET: ${JWT_SECRET}
      STORAGE_PATH: /data/backups
    volumes:
      - backup-data:/data/backups
    depends_on:
      - backup-db

volumes:
  pgdata:
  backup-data:
```

---

## 四、整合迭代时间线

| 阶段 | 内容 | 工期 | 备注 |
|------|------|------|------|
| **P0** | 第一阶段：基础写作闭环 | 2 周 | 客户端核心功能 |
| **P1** | 备份服务端 v1：用户管理 + 备份/恢复 | 1.5 周 | 服务端独立开发 |
| **P1** | 客户端备份集成：登录 UI + 备份/恢复 UI | 1 周 | 与服务端并行 |
| **P2** | 第二阶段：设定与 AI | 2 周 | |
| **P2** | 备份服务端 v2：自动备份 + 多版本 + 合并 | 1 周 | |
| **P3** | 第三阶段：图谱与地图 | 2 周 | |
| **P4** | 第四阶段：发布中心 | 2 周 | |

**总计约 10-12 周**，可按优先级灵活调整。

---

## 五、目录结构（备份服务端）

```
backup-server/
├── src/main/java/com/ainovelstudio/backup/
│   ├── BackupServerApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java          # Spring Security + JWT
│   │   ├── CorsConfig.java
│   │   └── StorageConfig.java           # 文件存储配置
│   ├── auth/
│   │   ├── AuthController.java          # 注册/登录/刷新
│   │   ├── AuthService.java
│   │   ├── JwtTokenProvider.java        # JWT 生成/验证
│   │   └── dto/
│   │       ├── LoginRequest.java
│   │       ├── RegisterRequest.java
│   │       └── TokenResponse.java
│   ├── user/
│   │   ├── User.java                    # 实体
│   │   ├── UserRepository.java
│   │   ├── UserService.java
│   │   └── UserController.java
│   ├── device/
│   │   ├── Device.java
│   │   ├── DeviceRepository.java
│   │   └── DeviceController.java
│   ├── backup/
│   │   ├── Backup.java                  # 实体
│   │   ├── BackupRepository.java
│   │   ├── BackupService.java           # 存储/检索/清理
│   │   ├── BackupController.java
│   │   └── StorageService.java          # 文件系统/S3 抽象
│   └── common/
│       ├── ApiResponse.java             # 统一响应格式
│       ├── GlobalExceptionHandler.java
│       └── RateLimitFilter.java         # 限流
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/                    # Flyway 迁移脚本
│       ├── V1__create_users.sql
│       ├── V2__create_devices.sql
│       └── V3__create_backups.sql
├── Dockerfile
└── pom.xml
```
