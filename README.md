# 乡村振兴·智兴乡村平台

## 项目简介

乡村振兴·智兴乡村平台是一个基于 Spring Boot + Vue 3 的全栈 Web 应用，致力于推动乡村数字化发展。系统集成了景点导览、旅游路线、特产电商、产品溯源、动态资讯、建言献策、AI 智能助手等多个功能模块，为乡村振兴提供全方位的数字化支持。

## 系统特色

- **景点导览** - 360°全景展示、地图定位（高德地图集成）、交通指引
- **旅游路线** - 官方推荐路线规划、多日行程安排、预算参考
- **特产商城** - 农产品在线销售、订单管理、支付系统
- **产品溯源** - 从种植到物流的全链路追溯、批次管理、质检记录
- **动态资讯** - 乡村发展新闻、政策解读、活动通知（天行数据API接入）
- **建言献策** - 村民意见反馈、问题上报、统计分析
- **乡村活动** - 活动发布与报名管理
- **天气服务** - 实时天气查询，辅助出行规划
- **AI 智能助手** - 基于 RAG 的智能推荐，支持商品/景点/资讯精准检索
- **用户中心** - 个人信息、订单管理、地址管理
- **管理后台** - 独立 React 管理系统，数据统计、内容管理、系统监控

## 技术架构

### 后端技术栈

- **框架**: Spring Boot 3.2.3
- **数据库**: MySQL 8.0 + MyBatis Plus 3.5.5
- **安全**: Spring Security + JWT
- **缓存**: Redis
- **地图服务**: 高德地图 API（POI同步、地理编码）
- **外部数据**: 天行数据 API（新闻资讯）
- **AI 框架**: LangChain4j 1.13.x（核心 1.13.0，Qdrant/DashScope 集成 1.13.0-beta23）
- **大语言模型**: 阿里通义千问 qwen-turbo（DashScope OpenAI 兼容接口）
- **向量数据库**: Qdrant
- **向量嵌入**: 通义千问 text-embedding-v3（1024 维）
- **全文检索**: Apache Lucene 9.9.1（BM25）
- **文档**: Swagger/OpenAPI 3
- **构建工具**: Maven
- **Java版本**: JDK 17

### 前端技术栈（用户端）

- **框架**: Vue 3.3.8
- **构建工具**: Vite 5.0.0
- **UI组件**: Element Plus 2.4.3
- **状态管理**: Pinia 2.1.7
- **路由**: Vue Router 4.2.5
- **HTTP客户端**: Axios 1.6.0
- **图表**: ECharts 6.0.0
- **地图**: 高德地图 JS API 2.0
- **样式**: SCSS

### 管理后台技术栈

- **框架**: React 19 + TypeScript 5.8
- **构建工具**: Vite 6.2
- **样式**: Tailwind CSS 4.1
- **路由**: React Router 7.14
- **图表**: Recharts 3.8
- **动画**: Motion (Framer Motion)
- **HTTP客户端**: Axios 1.15

## 项目结构

```
乡村振兴·智兴乡村/
├── back/                           # 后端项目
│   ├── src/main/java/com/cinema/booking/
│   │   ├── annotation/            # 自定义注解
│   │   ├── aspect/                # AOP切面
│   │   ├── config/                # 配置类（AI、Redis、安全、高德地图等）
│   │   ├── controller/            # 控制器层
│   │   ├── dto/                   # 数据传输对象
│   │   ├── entity/                # 实体类
│   │   ├── exception/             # 异常处理
│   │   ├── mapper/                # 数据访问层
│   │   ├── security/              # 安全配置
│   │   ├── service/               # 业务逻辑层
│   │   │   ├── ai/                # AI 智能助手模块
│   │   │   │   ├── RuralDigitalAgent.java
│   │   │   │   └── impl/
│   │   │   │       ├── DataIndexingService.java
│   │   │   │       ├── HybridRetrievalService.java
│   │   │   │       └── RuralDigitalTools.java
│   │   │   ├── amap/              # 高德地图同步服务
│   │   │   └── impl/              # 各业务模块实现
│   │   └── utils/                 # 工具类（含 Lucene BM25 引擎）
│   ├── src/main/resources/
│   │   ├── mapper/                # MyBatis XML映射文件
│   │   └── application.yml        # 配置文件
│   └── pom.xml                    # Maven依赖配置
├── front/                         # 前端用户端（Vue 3）
│   ├── src/
│   │   ├── api/                   # API接口
│   │   ├── assets/                # 静态资源（图片、样式）
│   │   ├── components/            # 公共组件（含 AiChatAssistant、RouteMap、WeatherCard）
│   │   ├── composables/           # 组合式函数
│   │   ├── mock/                  # Mock数据
│   │   ├── router/                # 路由配置
│   │   ├── stores/                # 状态管理（含 ai-chat.js）
│   │   └── views/                 # 页面组件
│   │       └── user/              # 用户端页面
│   ├── package.json
│   └── vite.config.js
├── front-admin/                   # 管理后台前端（React + TypeScript）
│   ├── src/
│   │   ├── api/                   # API接口模块
│   │   ├── components/            # 布局 + UI组件
│   │   ├── contexts/              # 全局状态（Auth + Toast）
│   │   ├── hooks/                 # 通用Hooks
│   │   ├── pages/                 # 业务页面
│   │   └── types/                 # TypeScript类型定义
│   ├── package.json
│   └── vite.config.ts
├── files/                         # 文件存储目录
├── village.sql                    # 数据库初始化脚本（统一）
└── README.md                      # 项目说明文档
```

## 核心功能模块

### 1. 用户管理系统
- 用户注册/登录
- JWT Token认证
- 角色权限控制（用户/管理员）
- 个人信息管理
- 密码修改

### 2. 景点导览系统
- 景点分类管理
- 景点详情展示
- 360°全景浏览
- 高德地图定位导航
- 交通指引信息
- 浏览统计

### 3. 旅游路线系统
- 官方推荐路线（一日游/两日游/三日游）
- 多日行程规划
- 景点关联与排序
- 预算参考（最低/最高）
- 难度分级（easy/medium/hard）
- 旅行贴士

### 4. 特产商城系统
- 商品分类管理
- 商品展示与搜索
- 购物车功能
- 订单管理
- 支付系统
- 商品评价
- 库存管理

### 5. 产品溯源系统
- 产品批次管理
- 全链路追溯（种植→生长→采摘→加工→质检→包装→物流）
- 质检记录展示
- 操作人/机构信息
- 溯源二维码/批次号查询

### 6. 资讯管理系统
- 新闻资讯发布
- 分类管理（新闻/政策/活动）
- 内容审核
- 天行数据 API 自动采集
- 浏览统计

### 7. 建言献策系统
- 意见建议提交
- 问题分类（环境、基础设施、农业、旅游、教育、其他）
- 帖子审核管理
- 评论互动与点赞
- 数据统计分析
- 管理员回复

### 8. 乡村活动系统
- 活动发布与管理
- 活动报名
- 活动分类与筛选

### 9. AI 智能助手系统

基于 RAG（检索增强生成）架构的智能对话推荐系统，覆盖商品、景点、资讯三大业务模块。

**技术架构：**
- **三级混合检索**：向量检索（Qdrant）+ BM25 关键词检索（Lucene）+ 语义精排
- **AI Agent**：LangChain4j AiServices + Tool Calling，支持 5 个业务工具自动调用
- **会话记忆**：Redis 持久化，24 小时自动过期，支持多用户会话隔离
- **智能路由**：关键词确定性路由 + 大模型 Agent 路由双重机制

**AI 工具列表：**

| 工具 | 功能 | 触发场景 |
|------|------|----------|
| retrieveProducts | 商品检索 | 询问特产/商品/购买 |
| retrieveScenics | 景点检索 | 询问景点/旅游 |
| retrieveNews | 资讯检索 | 询问资讯/政策/新闻 |
| retrieveProductsWithGoodReviews | 好评商品 | 询问好评/口碑 |
| retrieveProductReviews | 商品评论 | 询问某商品评价 |

### 10. 管理后台系统（front-admin）

独立的 React + TypeScript 管理后台，包含 19 个业务页面：

- **数据大屏**：统计图表、数据概览
- **用户管理**：用户 CRUD、角色管理、启禁用、密码重置
- **景点管理**：景点与分类管理、经纬度定位、门票价格
- **旅游路线管理**：路线规划、行程明细编辑
- **商品管理**：商品与分类管理、库存、批量状态更新
- **订单管理**：订单状态流转、取消、确认收货、统计
- **资讯管理**：资讯发布/编辑/下线
- **论坛管理**：帖子审核/置顶/精华、评论审核、数据统计
- **溯源管理**：溯源记录管理、批次管理
- **活动管理**：活动发布与报名管理
- **评价管理**：商品评价审核
- **系统管理**：系统配置、操作日志

## 数据库设计

数据库初始化脚本：`village.sql`（项目唯一 SQL 文件，包含全部建表、数据、视图、函数、存储过程和触发器）

### 数据表总览

**基础模块：** users、address

**景点模块：** attraction_categories、attractions、tour_routes、route_items

**商品模块：** product_categories、products、product_reviews、review_helpful、shopping_cart

**订单模块：** orders、order_items

**溯源模块：** product_batches、trace_records

**论坛模块：** forum_posts、forum_post_likes、forum_comments、forum_comment_likes

**资讯模块：** news

**系统模块：** system_config、system_logs

**数据库对象：** 2 视图 + 1 函数 + 1 存储过程 + 1 触发器

## 快速开始

### 环境要求

- JDK 17+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+
- Qdrant（向量数据库，用于 AI 智能助手）
- Maven 3.6+

### 后端启动

1. **克隆项目**
   ```bash
   git clone https://gitee.com/he-peng-2004/rural-digital.git
   cd rural-digital/back
   ```

2. **配置数据库**
   ```bash
   # 创建数据库
   mysql -u root -p
   CREATE DATABASE village CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   # 导入数据库脚本
   mysql -u root -p village < ../village.sql
   ```

3. **配置应用**
   编辑 `src/main/resources/application.yml`，配置数据库连接、Redis、DashScope API Key、高德地图 Key 等。

4. **启动 Qdrant 向量数据库**
   ```bash
   docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:1.17.1
   ```

5. **启动应用**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   后端服务将在 `http://localhost:7070` 启动

### 前端启动（用户端）

```bash
cd front
npm install
npm run dev
```

前端应用将在 `http://localhost:3000` 启动

### 管理后台启动

```bash
cd front-admin
npm install
npm run dev
```

管理后台将在 `http://localhost:3001` 启动

### 默认账号

- **管理员账号**: admin / 123456
- **普通用户**: 需要注册或通过管理后台创建

## API 文档

启动后端服务后，访问 Swagger API 文档：
- 地址：`http://localhost:7070/swagger-ui/index.html`

## 主要接口

### 认证相关
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /auth/user/info` - 获取用户信息
- `POST /auth/logout` - 用户登出

### 景点管理
- `GET /attractions/page` - 分页查询景点
- `GET /attractions/{id}` - 获取景点详情
- `POST /attractions` - 创建景点（管理员）
- `PUT /attractions/{id}` - 更新景点（管理员）

### 旅游路线
- `GET /tour-routes/page` - 分页查询路线
- `GET /tour-routes/{id}` - 获取路线详情
- `POST /tour-routes` - 创建路线（管理员）

### 商品管理
- `GET /products/page` - 分页查询商品
- `GET /products/{id}` - 获取商品详情
- `GET /products/featured` - 获取推荐商品

### 产品溯源
- `GET /trace/product/{productId}` - 获取产品溯源信息
- `GET /trace/batch/{batchNo}` - 按批次号查询

### 订单管理
- `POST /orders` - 创建订单
- `GET /orders/user/{userId}` - 获取用户订单
- `PUT /orders/{id}/status` - 更新订单状态

### 论坛功能
- `GET /forum/posts/page` - 分页查询帖子
- `POST /forum/posts` - 创建帖子
- `POST /forum/posts/{id}/like` - 点赞/取消点赞

### AI 智能助手
- `POST /api/ai/chat` - AI 对话（请求体为纯文本，Header 携带 userId）

## 部署说明

### 生产环境部署

1. **后端部署**
   ```bash
   mvn clean package -Dmaven.test.skip=true
   java -jar target/village-revival-system-0.0.1-SNAPSHOT.jar
   ```

2. **前端部署**
   ```bash
   cd front && npm run build
   cd ../front-admin && npm run build
   ```

3. **Nginx 配置示例**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # 用户端
       location / {
           root /var/www/front;
           try_files $uri $uri/ /index.html;
       }

       # 管理后台
       location /admin/ {
           root /var/www/admin;
           try_files $uri $uri/ /admin/index.html;
       }

       # 后端API代理
       location /api/ {
           proxy_pass http://localhost:7070/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 开发规范

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目仓库：https://gitee.com/he-peng-2004/rural-digital
- Issues：[Gitee Issues](https://gitee.com/he-peng-2004/rural-digital/issues)

## 更新日志

### v2.0.0 (2026-04)
- 新增旅游路线模块（路线规划、行程管理）
- 新增产品溯源系统（全链路追溯、批次管理、质检记录）
- 新增乡村活动模块（活动发布与报名）
- 新增天气服务（实时天气查询）
- 集成高德地图（POI同步、地理编码、地图展示）
- 集成天行数据 API（新闻自动采集）
- 管理后台目录重命名 froont-admin → front-admin
- 管理后台新增溯源、路线、活动管理页面
- 数据库脚本合并规范化（统一为 village.sql）

### v1.1.0 (2025-04)
- 新增 AI 智能助手（RAG + LangChain4j + 通义千问）
- 新增管理后台前端（React + TypeScript + Tailwind CSS）
- 实现三级混合检索（向量 + BM25 + 语义精排）
- 实现会话记忆管理（Redis + 多用户隔离）
- 智能路由机制（关键词路由 + Agent 路由）

### v1.0.0 (2025-09)
- 完成基础框架搭建
- 实现用户认证系统
- 完成景点导览功能
- 实现特产商城系统
- 开发建言献策论坛
- 构建管理后台系统
- 集成数据统计分析

---

**乡村振兴·智兴乡村** - 用科技助力乡村振兴，用智慧点亮美好未来！
