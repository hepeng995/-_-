# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

"乡村振兴·智兴乡村平台"——全栈乡村数字化振兴平台，集成景点游览、特产电商、新闻公告、社区论坛、AI 智能助手（RAG 架构）和管理后台。

**技术栈：**
- 后端：Spring Boot 3.2.3 + Java 17 + MyBatis-Plus + Spring Security (JWT)
- AI：LangChain4j + 阿里云 DashScope (Qwen-turbo) + Qdrant 向量数据库 + Apache Lucene BM25
- 用户前端：Vue 3 + Vite 5 + Element Plus + Pinia
- 管理后台：React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- 微信小程序：uni-app + Vue 3 + TypeScript + Pinia
- 数据层：MySQL 8.0 + Redis

## 开发命令

### 后端（`back/`）
```bash
cd back
mvn spring-boot:run              # 启动后端（端口 7070）
mvn clean package -DskipTests    # 打包
mvn test                         # 运行测试
```

### 用户前端（`front/`）
```bash
cd front
npm install
npm run dev       # 开发服务器（端口 3000）
npm run build     # 构建
```

### 管理后台（`froont-admin/`）
```bash
cd froont-admin
npm install
npm run dev       # 开发服务器（端口 3001）
npm run build     # 构建
npm run lint      # TypeScript 类型检查
```

### 微信小程序（`front-weixin/`）
```bash
cd front-weixin
npm install
npm run dev       # 开发（默认 mp-weixin 平台，使用微信开发者工具预览）
npm run build     # 构建
npm run type-check  # TypeScript 类型检查
```

## 架构概览

```
                     ┌─────────────────┐
                     │   Backend API   │
                     │  localhost:7070  │
                     └────────┬────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
  ┌───────▼──────┐  ┌────────▼───────┐  ┌───────▼──────┐
  │   front/     │  │ front-weixin/  │  │ froont-admin/ │
  │  Vue 3 SPA   │  │   uni-app      │  │  React 19 SPA │
  │  Port 3000   │  │  微信小程序     │  │  Port 3001    │
  │  (用户端)     │  │                │  │  (管理后台)    │
  └──────────────┘  └────────────────┘  └───────────────┘
```

所有前端通过 Vite dev proxy 将 `/api` 转发至 `http://localhost:7070`，并自动剥离 `/api` 前缀。

## 后端架构

### 分层结构（`com.cinema.booking`）
- **controller/** — REST 控制器（15个），Swagger 注解，`@PreAuthorize` 鉴权
- **service/** + **service/impl/** — 接口+实现模式（12个服务）
- **service/ai/** + **service/ai/impl/** — AI/RAG 智能助手模块
- **mapper/** — MyBatis-Plus BaseMapper 接口（18个）+ XML 映射文件
- **entity/** — MyBatis-Plus 实体类（@TableName + Lombok @Data）
- **dto/** — 数据传输对象（30+），含通用 `CommonCardDTO` 供 AI 模块使用
- **security/** — JWT 过滤器 + Spring Security 配置
- **config/** — AI Bean 装配、MyBatis-Plus、Redis、CORS 等配置
- **aspect/** — AOP 操作日志（`@SystemOperation` 注解触发）
- **exception/** — 全局异常处理（`GlobalExceptionHandler`）

### API 响应格式
所有接口返回 `Result<T>`，结构为 `{code, message, data}`。code=200 表示成功。

### 认证机制
- JWT Bearer Token，存储在 `sessionStorage`（Web）或 `uni.getStorageSync`（小程序）
- 公开端点：`/auth/**`、`/file/**`、`/swagger-ui/**`
- 401 自动跳转登录页

### AI/RAG 管线（核心模块）
```
用户提问 → AiChatController
    ├─ 关键词路由（确定性查询）→ RuralDigitalTools → HybridRetrievalService
    └─ LLM Agent 路由 → RuralDigitalAgent (LangChain4j AiServices)
         └─ 工具调用 → RuralDigitalTools → HybridRetrievalService

三阶段混合检索:
  1. 双路粗召回: Qdrant 向量搜索 (top50) + Lucene BM25 (top50) → 合并去重
  2. BGE 语义重排: DashScope text-embedding-v3 余弦相似度 → top10
  3. 返回 top10 结果

降级策略: Qdrant 不可用 → BM25-only → 直接数据库查询
```

关键文件：
- `service/ai/RuralDigitalAgent.java` — LangChain4j AiServices 接口
- `service/ai/impl/RuralDigitalTools.java` — 5个 @Tool 方法
- `service/ai/impl/HybridRetrievalService.java` — 三阶段混合检索
- `service/ai/impl/DataIndexingService.java` — 启动时重建索引（CommandLineRunner）
- `service/ai/impl/QdrantVectorSearchAdapter.java` — Qdrant gRPC 封装
- `utils/LuceneBM25Manager.java` — 内存 Lucene BM25 索引
- `config/AIConfig.java` — AI Bean 装配（Embedding、Chat、Agent、Memory）

对话记忆：Redis 存储，key 前缀 `rag:session:`，24小时 TTL，每用户最多 50 条消息。

### 数据库
- MySQL `village` 库，初始化脚本：`village.sql`
- MyBatis-Plus：下划线转驼峰、逻辑删除（`deleted` 字段 0/1）、自增主键
- 分页插件（MySQL 方言）+ 防全表更新/删除插件

## 前端架构

### 用户前端（`front/`）
- Vue 3 Composition API (`<script setup>`)
- 路由：`/home`、`/attractions`、`/products`、`/news`、`/forum`（公开）；`/cart`、`/user/*`（需登录）
- Pinia stores：`user`（token/用户信息）、`cart`（购物车）、`ai-chat`（AI 对话）
- API 层：`src/api/request.js`（Axios 实例，baseURL `/api`）
- 注意：`/admin/*` 路由已迁移至 React 管理后台（重定向到 localhost:3001）

### 管理后台（`froont-admin/`）
- React 19 + TypeScript + Tailwind CSS 4
- 路由：`<ProtectedRoute>` 包裹所有管理页，14 个管理页面
- Auth：`AuthContext` + `useAuth()` hook，token 在 sessionStorage
- API 层：类型安全的 `request.get<T>()` 等方法，12 个 API 模块
- 组件：`components/ui/`（Card、Modal、ConfirmDialog）、`hooks/`（usePagination、useToast）

### 微信小程序（`front-weixin/`）
- uni-app + Vue 3 + TypeScript
- 5 个 TabBar 页 + 5 个分包（pages-order、pages-user、pages-forum、pages-ai、pages-review）
- Mock 系统：通过环境变量 `VITE_ENABLE_MOCK_*` 控制，支持 API 回退和模拟支付
- 主题色：竹绿 `#1F6A45`

## 外部服务依赖

| 服务 | 端口 | 说明 |
|------|------|------|
| MySQL | 3306 | 数据库 `village` |
| Redis | 6379 | 缓存 + AI 对话记忆 |
| Qdrant | 6333/6334 | 向量数据库（HTTP/gRPC），Docker 启动：`docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:1.17.1` |
| DashScope API | — | 阿里云 LLM + Embedding 服务 |

## 注意事项

- 后端包名 `com.cinema.booking` 沿用自初始脚手架，实际为乡村振兴项目
- 管理后台目录名为 `froont-admin/`（拼写特殊，非 `front-admin`）
- AI 索引在每次应用启动时通过 `DataIndexingService`（CommandLineRunner）完整重建
- Swagger 文档：`http://localhost:7070/swagger-ui/index.html`
- 文件上传存储在 `files/` 目录，路径配置在 `application.yml`
- 前端 API 代理统一使用 `/api` 前缀，Vite 自动剥离
