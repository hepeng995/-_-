# 乡村振兴·智兴乡村，数创未来平台

> 全栈乡村数字化振兴平台 — 集景点导览、旅游路线、特产电商、产品溯源、新闻资讯、社区论坛、AI 智能助手与管理后台于一体。

## 项目简介

乡村振兴·智兴乡村，数创未来平台是一个面向乡村振兴场景的全栈 Web 应用，旨在通过数字化手段推动乡村发展。系统采用 Spring Boot + Vue 3 + React 的前后端分离架构，集成 AI RAG 智能助手，为游客提供景点导览、路线规划、特产购买、产品溯源等服务，同时为管理员提供完整的后台管理系统。

## 系统特色

| 模块 | 说明 |
|------|------|
| 景点导览 | 360° 全景展示、高德地图定位导航、交通指引 |
| 旅游路线 | 官方推荐路线规划、多日行程安排、预算参考 |
| 特产商城 | 农产品在线销售、购物车、订单管理、支付系统 |
| 产品溯源 | 从种植到物流全链路追溯、批次管理、质检记录 |
| 动态资讯 | 乡村发展新闻、政策解读、活动通知（天行数据 API） |
| 建言献策 | 村民意见反馈、帖子审核、评论互动与点赞 |
| 乡村活动 | 活动发布与报名管理 |
| 天气服务 | 实时天气查询，辅助出行规划 |
| AI 智能助手 | 基于 RAG 架构的智能推荐，支持商品/景点/资讯精准检索 |
| 用户中心 | 个人信息、订单管理、地址管理 |
| 管理后台 | 独立 React 管理系统，数据统计、内容管理、系统监控 |

## 技术架构

### 整体架构

```
                         ┌──────────────────────┐
                         │     Backend API      │
                         │   Spring Boot 3.2.3  │
                         │    localhost:7070     │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
     ┌────────▼───────┐            │            ┌────────▼───────┐
     │    front/      │            │            │  front-admin/  │
     │   Vue 3 SPA    │            │            │  React 19 SPA  │
     │  Port 3000     │            │            │   Port 3001    │
     │   (用户端)      │            │            │   (管理后台)    │
     └────────────────┘            │            └────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼──────┐  ┌─────────▼──────┐  ┌─────────▼──────┐
     │   MySQL 8.0   │  │   Redis 7.x    │  │  Qdrant 1.17   │
     │   village 库   │  │ 缓存 + 会话记忆  │  │   向量数据库    │
     └───────────────┘  └────────────────┘  └────────────────┘
```

所有前端通过 Vite dev proxy 将 `/api` 转发至 `http://localhost:7070`，并自动剥离 `/api` 前缀。

### 后端技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Spring Boot 3.2.3 + JDK 17 |
| 数据库 | MySQL 8.0 + MyBatis-Plus 3.5.5 |
| 安全 | Spring Security + JWT (jjwt 0.11.5) |
| 缓存 | Redis 7.x (Spring Data Redis) |
| AI 框架 | LangChain4j 1.13.0 + DashScope 社区版 |
| 大语言模型 | 阿里通义千问 qwen-turbo (DashScope OpenAI 兼容接口) |
| 向量数据库 | Qdrant 1.17.1 (gRPC) |
| 向量嵌入 | 通义千问 text-embedding-v3 (1024 维) |
| 全文检索 | Apache Lucene 9.9.1 (BM25) |
| 地图服务 | 高德地图 API (POI 同步、地理编码) |
| 外部数据 | 天行数据 API (新闻资讯)、Jsoup (网页抓取) |
| API 文档 | SpringDoc OpenAPI (Swagger) |
| 构建工具 | Maven |
| 分页 | PageHelper |

### 用户前端 (`front/`)

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.3.8 (Composition API `<script setup>`) |
| 构建 | Vite 5.0.0 |
| UI 组件 | Element Plus 2.4.3 |
| 状态管理 | Pinia 2.1.7 |
| 路由 | Vue Router 4.2.5 |
| HTTP 客户端 | Axios 1.6.0 |
| 图表 | ECharts 6.0.0 |
| 地图 | 高德地图 JS API 2.0 |
| 样式 | SCSS |

### 管理后台 (`front-admin/`)

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 5.8 |
| 构建 | Vite 6.2 |
| 样式 | Tailwind CSS 4.1 |
| 路由 | React Router 7.14 |
| 图表 | Recharts 3.8 |
| 动画 | Motion (Framer Motion) |
| HTTP 客户端 | Axios 1.15 |

## 项目结构

```
rural-digital/
├── back/                              # 后端项目 (Spring Boot)
│   ├── Dockerfile                     # 生产环境 Docker 镜像
│   ├── pom.xml                        # Maven 依赖配置
│   └── src/main/
│       ├── java/com/cinema/booking/
│       │   ├── annotation/            # 自定义注解 (@SystemOperation)
│       │   ├── aspect/                # AOP 切面 (操作日志)
│       │   ├── config/                # 配置类 (AI、Redis、Security、CORS、MyBatis)
│       │   ├── controller/            # REST 控制器 (21 个)
│       │   ├── dto/                   # 数据传输对象 (30+)
│       │   ├── entity/                # MyBatis-Plus 实体类 (21 个)
│       │   ├── exception/             # 全局异常处理
│       │   ├── mapper/                # 数据访问层 (MyBatis-Plus BaseMapper)
│       │   ├── security/              # JWT 过滤器 + Spring Security 配置
│       │   ├── service/
│       │   │   ├── ai/                # AI/RAG 智能助手模块
│       │   │   │   ├── RuralDigitalAgent.java      # LangChain4j AiServices 接口
│       │   │   │   └── impl/
│       │   │   │       ├── DataIndexingService.java    # 启动时重建索引
│       │   │   │       ├── HybridRetrievalService.java # 三阶段混合检索
│       │   │   │       ├── QdrantVectorSearchAdapter.java # Qdrant gRPC 封装
│       │   │   │       └── RuralDigitalTools.java      # 5 个 @Tool 方法
│       │   │   └── impl/              # 各业务模块 Service 实现
│       │   └── utils/                 # 工具类 (含 Lucene BM25 引擎)
│       └── resources/
│           ├── application.yml        # 主配置
│           ├── application-prod.yml   # 生产环境配置
│           └── mapper/                # MyBatis XML 映射文件
│
├── front/                             # 用户前端 (Vue 3)
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/                       # API 接口 (18 个模块)
│       ├── assets/                    # 静态资源 (图片、SCSS 样式)
│       ├── components/                # 公共组件 (11 个)
│       │   ├── AiChatAssistant.vue    # AI 对话助手浮窗
│       │   ├── LocationMap.vue        # 高德地图组件
│       │   ├── RouteMap.vue           # 路线地图组件
│       │   └── WeatherCard.vue        # 天气卡片组件
│       ├── composables/               # 组合式函数
│       ├── router/                    # 路由配置
│       ├── stores/                    # Pinia 状态管理 (user, cart, ai-chat)
│       └── views/user/                # 用户端页面 (23 个)
│           ├── home.vue               # 首页
│           ├── attractions.vue        # 景点列表
│           ├── products.vue           # 商品列表
│           ├── routes.vue             # 旅游路线列表
│           ├── forum.vue              # 建言献策论坛
│           ├── news.vue               # 新闻资讯
│           ├── cart.vue               # 购物车
│           ├── orders.vue             # 订单列表
│           ├── trace-view.vue         # 溯源查询
│           └── ...
│
├── front-admin/                       # 管理后台 (React + TypeScript)
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── api/                       # API 接口 (15 个模块)
│       ├── components/                # 布局 + UI 组件
│       ├── contexts/                  # AuthContext + ToastContext
│       ├── hooks/                     # 通用 Hooks (usePagination, useToast)
│       ├── pages/                     # 管理页面 (20 个)
│       │   ├── Dashboard.tsx          # 数据大屏
│       │   ├── Users.tsx              # 用户管理
│       │   ├── Attractions.tsx        # 景点管理
│       │   ├── Products.tsx           # 商品管理
│       │   ├── TourRoutes.tsx         # 路线管理
│       │   ├── TraceRecords.tsx       # 溯源管理
│       │   ├── Activities.tsx         # 活动管理
│       │   ├── SystemLogs.tsx         # 系统日志
│       │   └── ...
│       └── types/                     # TypeScript 类型定义
│
├── deploy/
│   └── nginx.conf                     # Nginx 生产环境配置
│
├── files/                             # 文件上传存储目录
├── docker-compose.yml                 # Docker Compose 编排
├── village.sql                        # 数据库初始化脚本 (唯一)
├── CLAUDE.md                          # Claude Code 项目指引
└── README.md
```

## 核心功能模块

### 1. 用户管理系统

- 用户注册 / 登录
- JWT Token 认证
- 角色权限控制（用户 / 管理员）
- 个人信息管理、密码修改、地址管理

### 2. 景点导览系统

- 景点分类管理、详情展示
- 360° 全景浏览
- 高德地图定位导航、交通指引
- 浏览统计

### 3. 旅游路线系统

- 官方推荐路线（一日游 / 两日游 / 三日游）
- 多日行程规划、景点关联与排序
- 预算参考（最低 / 最高）、难度分级
- 旅行贴士

### 4. 特产商城系统

- 商品分类、展示与搜索
- 购物车、订单管理、支付系统
- 商品评价、库存管理

### 5. 产品溯源系统

- 产品批次管理
- 全链路追溯：种植 → 生长 → 采摘 → 加工 → 质检 → 包装 → 物流
- 质检记录展示、操作人 / 机构信息
- 溯源二维码 / 批次号查询

### 6. 资讯管理系统

- 新闻资讯发布、分类管理（新闻 / 政策 / 活动）
- 天行数据 API 自动采集、内容审核
- 浏览统计

### 7. 建言献策系统

- 意见建议提交、问题分类（环境、基础设施、农业、旅游、教育、其他）
- 帖子审核管理、评论互动与点赞
- 数据统计分析、管理员回复

### 8. 乡村活动系统

- 活动发布与管理
- 活动报名、分类与筛选

### 9. AI 智能助手系统

基于 RAG（检索增强生成）架构的智能对话推荐系统，覆盖商品、景点、资讯三大业务模块。

**技术架构：**

```
用户提问 → AiChatController
    ├─ 关键词路由（确定性查询）→ RuralDigitalTools → HybridRetrievalService
    └─ LLM Agent 路由 → RuralDigitalAgent (LangChain4j AiServices)
         └─ 工具调用 → RuralDigitalTools → HybridRetrievalService
```

**三阶段混合检索：**

1. **双路粗召回** — Qdrant 向量搜索 (top50) + Lucene BM25 (top50) → 合并去重
2. **BGE 语义重排** — DashScope text-embedding-v3 余弦相似度 → top10
3. **返回 top10 结果**

**降级策略：** Qdrant 不可用 → BM25-only → 直接数据库查询

**AI 工具列表：**

| 工具 | 功能 | 触发场景 |
|------|------|----------|
| `retrieveProducts` | 商品检索 | 询问特产 / 商品 / 购买 |
| `retrieveScenics` | 景点检索 | 询问景点 / 旅游 |
| `retrieveNews` | 资讯检索 | 询问资讯 / 政策 / 新闻 |
| `retrieveProductsWithGoodReviews` | 好评商品 | 询问好评 / 口碑 |
| `retrieveProductReviews` | 商品评论 | 询问某商品评价 |

**对话记忆：** Redis 持久化，key 前缀 `rag:session:`，24 小时 TTL，每用户最多 50 条消息。

### 10. 管理后台系统

独立 React + TypeScript 管理后台，包含 20 个业务页面：

- **数据大屏** — 统计图表、数据概览
- **用户管理** — 用户 CRUD、角色管理、启禁用、密码重置
- **景点管理** — 景点与分类管理、经纬度定位、门票价格
- **旅游路线管理** — 路线规划、行程明细编辑
- **商品管理** — 商品与分类管理、库存、批量状态更新
- **订单管理** — 订单状态流转、取消、确认收货、统计
- **资讯管理** — 资讯发布 / 编辑 / 下线
- **论坛管理** — 帖子审核 / 置顶 / 精华、评论审核、数据统计
- **溯源管理** — 溯源记录管理、批次管理
- **活动管理** — 活动发布与报名管理
- **评价管理** — 商品评价审核
- **系统管理** — 系统配置、操作日志

## 数据库设计

初始化脚本：`village.sql`（项目唯一 SQL 文件，含全部建表、数据、视图、函数、存储过程和触发器）

### 数据表总览

| 模块 | 数据表 |
|------|--------|
| 用户 | `users`、`address` |
| 景点 | `attraction_categories`、`attractions`、`tour_routes`、`route_items` |
| 商品 | `product_categories`、`products`、`product_reviews`、`review_helpful`、`shopping_cart` |
| 订单 | `orders`、`order_items` |
| 溯源 | `product_batches`、`trace_records` |
| 论坛 | `forum_posts`、`forum_post_likes`、`forum_comments`、`forum_comment_likes` |
| 资讯 | `news` |
| 系统 | `system_config`、`system_logs` |

**数据库对象：** 2 视图 + 1 函数 + 1 存储过程 + 1 触发器

## 快速开始

### 环境要求

| 工具 | 版本 |
|------|------|
| JDK | 17+ |
| Maven | 3.6+ |
| Node.js | 16+ |
| MySQL | 8.0+ |
| Redis | 6.0+ |
| Qdrant | 1.17+ |
| Docker (可选) | 20+ |

### 1. 克隆项目

```bash
git clone https://gitee.com/he-peng-2004/rural-digital.git
cd rural-digital
```

### 2. 配置数据库

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE village CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入数据
mysql -u root -p village < village.sql
```

### 3. 配置后端

编辑 `back/src/main/resources/application.yml`，配置以下项：

- MySQL 连接信息
- Redis 连接信息
- DashScope API Key（AI 功能）
- 高德地图 Key（地图功能）

### 4. 启动 Qdrant

```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:1.17.1
```

### 5. 启动后端

```bash
cd back
mvn clean install
mvn spring-boot:run
```

后端服务运行于 `http://localhost:7070`

### 6. 启动用户前端

```bash
cd front
npm install
npm run dev
```

用户前端运行于 `http://localhost:3000`

### 7. 启动管理后台

```bash
cd front-admin
npm install
npm run dev
```

管理后台运行于 `http://localhost:3001`

### 默认账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | admin | 123456 |
| 普通用户 | 需注册 | — |

## API 文档

启动后端后访问 Swagger 文档：`http://localhost:7070/swagger-ui/index.html`

### 主要接口一览

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 认证 | POST | `/auth/login` | 用户登录 |
| 认证 | POST | `/auth/register` | 用户注册 |
| 认证 | GET | `/auth/user/info` | 获取用户信息 |
| 景点 | GET | `/attractions/page` | 分页查询景点 |
| 景点 | GET | `/attractions/{id}` | 景点详情 |
| 路线 | GET | `/tour-routes/page` | 分页查询路线 |
| 路线 | GET | `/tour-routes/{id}` | 路线详情 |
| 商品 | GET | `/products/page` | 分页查询商品 |
| 商品 | GET | `/products/{id}` | 商品详情 |
| 商品 | GET | `/products/featured` | 推荐商品 |
| 溯源 | GET | `/trace/product/{productId}` | 产品溯源信息 |
| 溯源 | GET | `/trace/batch/{batchNo}` | 批次号查询 |
| 订单 | POST | `/orders` | 创建订单 |
| 订单 | GET | `/orders/user/{userId}` | 用户订单列表 |
| 论坛 | GET | `/forum/posts/page` | 分页查询帖子 |
| 论坛 | POST | `/forum/posts` | 创建帖子 |
| 论坛 | POST | `/forum/posts/{id}/like` | 点赞 / 取消点赞 |
| AI | POST | `/api/ai/chat` | AI 对话 |
| AI | GET | `/ai/health` | AI 配置与依赖自检 |

## 部署

### Docker Compose 一键部署

```bash
# 1. 先编辑 Ubuntu 服务器上的 AI / 第三方接口配置文件
vim deploy/application-prod.server.yml

# 至少替换以下占位项，否则后端会在启动阶段直接失败
# - PLEASE_SET_DASHSCOPE_API_KEY
# - PLEASE_SET_QWEATHER_API_KEY
# - PLEASE_SET_TIANAPI_API_KEY
# - PLEASE_SET_AMAP_WEB_KEY

# 2. 构建后端 JAR
cd back && mvn clean package -DskipTests && cd ..

# 3. 校验 Compose 配置
docker compose -p village-platform config

# 4. 启动全部服务
docker compose -p village-platform up -d --build
```

**说明：**

- `deploy/application-prod.server.yml` 会以挂载文件的形式覆盖容器内的生产 AI 配置。
- AI 模块使用配置文件直配，不依赖 `DASHSCOPE_API_KEY` 之类的环境变量。
- 如果 DashScope API Key 未配置或仍然是占位值，后端会在启动阶段直接失败，避免带坏配置上线。
- 启动后可访问 `GET /api/ai/health` 检查 AI 配置是否生效。

### 手动部署

**1. 后端**

```bash
cd back
mvn clean package -DskipTests
java -jar target/village-revival-system-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

如果是 Ubuntu 手动部署，建议直接编辑 `back/src/main/resources/application-prod.yml`，确保以下配置为真实值：

- `langchain4j.open-ai.chat-model.api-key`
- `cinema.ai.embedding-model-name`
- `qweather.api-key`
- `tianapi.api-key`
- `amap.web-key`

**2. 前端构建**

```bash
cd front && npm run build          # 产出 → front/dist/
cd ../front-admin && npm run build # 产出 → front-admin/dist/
```

**3. Nginx 配置**

参考 `deploy/nginx.conf`，关键配置：

- `/api/` → 反向代理至 Spring Boot (`127.0.0.1:7070`)
- `/admin/` → 管理后台静态文件
- `/` → 用户前端静态文件
- 开启 Gzip 压缩，静态资源缓存 30 天

## 开发规范

### Git 提交规范

```
feat:     新功能
fix:      修复 Bug
docs:     文档更新
style:    代码格式化（不影响逻辑）
refactor: 代码重构
test:     测试相关
chore:    构建过程或辅助工具变动
```

### 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 — 详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目仓库：https://gitee.com/he-peng-2004/rural-digital
- 问题反馈：[Gitee Issues](https://gitee.com/he-peng-2004/rural-digital/issues)

---

**乡村振兴·智兴乡村，数创未来平台** — 用科技助力乡村振兴，用智慧点亮美好未来！
