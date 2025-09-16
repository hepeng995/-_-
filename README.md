# 乡村振兴·新桃源智界系统

## 项目简介

乡村振兴·新桃源智界系统是一个基于 Spring Boot + Vue 3 的全栈 Web 应用，致力于推动乡村数字化发展。系统集成了景点导览、特产商城、动态资讯、建言献策等多个功能模块，为乡村振兴提供全方位的数字化支持。

## 系统特色

- 🏞️ **景点导览** - 360°全景展示、地图定位、交通指引
- 🛍️ **特产商城** - 农产品在线销售、订单管理、支付系统
- 📰 **动态资讯** - 乡村发展新闻、政策解读、活动通知
- 💬 **建言献策** - 村民意见反馈、问题上报、统计分析
- 👤 **用户中心** - 个人信息、订单管理、地址管理
- 🔧 **管理后台** - 内容管理、数据统计、系统监控

## 技术架构

### 后端技术栈

- **框架**: Spring Boot 3.2.3
- **数据库**: MySQL 8.0 + MyBatis Plus 3.5.5
- **安全**: Spring Security + JWT
- **缓存**: Redis
- **文档**: Swagger/OpenAPI 3
- **构建工具**: Maven
- **Java版本**: JDK 17

### 前端技术栈

- **框架**: Vue 3.3.8
- **构建工具**: Vite 5.0.0
- **UI组件**: Element Plus 2.4.3
- **状态管理**: Pinia 2.1.7
- **路由**: Vue Router 4.2.5
- **HTTP客户端**: Axios 1.6.0
- **图表**: ECharts 6.0.0
- **样式**: SCSS

## 项目结构

```
乡村振兴·新桃源智界/
├── back/                           # 后端项目
│   ├── src/main/java/com/cinema/booking/
│   │   ├── annotation/            # 自定义注解
│   │   ├── aspect/                # AOP切面
│   │   ├── config/                # 配置类
│   │   ├── controller/            # 控制器层
│   │   ├── dto/                   # 数据传输对象
│   │   ├── entity/                # 实体类
│   │   ├── exception/             # 异常处理
│   │   ├── mapper/                # 数据访问层
│   │   ├── security/              # 安全配置
│   │   ├── service/               # 业务逻辑层
│   │   └── utils/                 # 工具类
│   ├── src/main/resources/
│   │   ├── mapper/                # MyBatis XML映射文件
│   │   └── application.yml        # 配置文件
│   └── pom.xml                    # Maven依赖配置
├── front/                         # 前端项目
│   ├── src/
│   │   ├── api/                   # API接口
│   │   ├── assets/                # 静态资源
│   │   ├── components/            # 公共组件
│   │   ├── router/                # 路由配置
│   │   ├── stores/                # 状态管理
│   │   ├── utils/                 # 工具函数
│   │   └── views/                 # 页面组件
│   │       ├── admin/             # 管理后台页面
│   │       ├── order/             # 订单相关页面
│   │       └── user/              # 用户端页面
│   ├── package.json               # 依赖配置
│   └── vite.config.js             # Vite配置
├── files/                         # 文件存储目录
├── village.sql                    # 数据库脚本
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
- 地图定位导航
- 交通指引信息
- 浏览统计

### 3. 特产商城系统
- 商品分类管理
- 商品展示与搜索
- 购物车功能
- 订单管理
- 支付系统
- 商品评价
- 库存管理

### 4. 资讯管理系统
- 新闻资讯发布
- 分类管理
- 内容审核
- 浏览统计
- 搜索功能

### 5. 建言献策系统
- 意见建议提交
- 问题分类（环境、基础设施、农业、旅游、教育、其他）
- 帖子审核管理
- 评论互动
- 点赞功能
- 数据统计分析
- 管理员回复

### 6. 管理后台系统
- 数据大屏展示
- 用户管理
- 内容管理
- 订单管理
- 系统日志
- 参数配置
- 论坛统计

## 数据库设计

### 主要数据表

- **users** - 用户信息表
- **attractions** - 景点信息表
- **attraction_categories** - 景点分类表
- **products** - 商品信息表
- **product_categories** - 商品分类表
- **orders** - 订单表
- **order_items** - 订单详情表
- **shopping_cart** - 购物车表
- **address** - 收货地址表
- **news** - 新闻资讯表
- **forum_posts** - 论坛帖子表
- **forum_comments** - 论坛评论表
- **forum_post_likes** - 帖子点赞表
- **forum_comment_likes** - 评论点赞表
- **product_reviews** - 商品评价表
- **system_logs** - 系统日志表

## 快速开始

### 环境要求

- JDK 17+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 后端启动

1. **克隆项目**
   ```bash
   git clone [项目地址]
   cd 乡村振兴·新桃源智界/back
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
   ```yaml
   # 修改 src/main/resources/application.yml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/village?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
       username: root
       password: your_password
     data:
       redis:
         host: localhost
         port: 6379
   ```

4. **启动应用**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   后端服务将在 `http://localhost:7070` 启动

### 前端启动

1. **进入前端目录**
   ```bash
   cd ../front
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

   前端应用将在 `http://localhost:3000` 启动

### 默认账号

- **管理员账号**: admin / admin123
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

### 商品管理
- `GET /products/page` - 分页查询商品
- `GET /products/{id}` - 获取商品详情
- `GET /products/featured` - 获取推荐商品
- `POST /products` - 创建商品（管理员）

### 订单管理
- `POST /orders` - 创建订单
- `GET /orders/user/{userId}` - 获取用户订单
- `PUT /orders/{id}/status` - 更新订单状态

### 论坛功能
- `GET /forum/posts/page` - 分页查询帖子
- `POST /forum/posts` - 创建帖子
- `POST /forum/posts/{id}/like` - 点赞/取消点赞
- `GET /forum/statistics/overview` - 获取统计数据

## 部署说明

### 生产环境部署

1. **后端部署**
   ```bash
   # 打包应用
   mvn clean package -Dmaven.test.skip=true
   
   # 运行jar包
   java -jar target/village-revival-system-0.0.1-SNAPSHOT.jar
   ```

2. **前端部署**
   ```bash
   # 构建生产版本
   npm run build
   
   # 部署到 Web 服务器（如 Nginx）
   cp -r dist/* /var/www/html/
   ```

3. **Nginx 配置示例**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # 前端静态文件
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }
       
       # 后端API代理
       location /api/ {
           proxy_pass http://localhost:7070/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 系统截图

### 前台用户端
- 首页展示：乡村风貌、功能导航
- 景点导览：景点列表、详情展示、全景浏览
- 特产商城：商品展示、购物车、订单管理
- 建言献策：问题反馈、建议提交、互动交流

### 管理后台
- 数据大屏：统计图表、数据概览
- 内容管理：景点、商品、资讯管理
- 用户管理：用户信息、权限控制
- 论坛管理：帖子审核、数据统计

## 开发规范

### 代码规范
- 后端遵循阿里巴巴Java开发手册
- 前端遵循Vue.js风格指南
- 使用ESLint和Prettier进行代码格式化

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
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issues：[GitHub Issues]
- 邮箱：[开发者邮箱]

## 更新日志

### v1.0.0 (2025-09-16)
- ✨ 完成基础框架搭建
- ✨ 实现用户认证系统
- ✨ 完成景点导览功能
- ✨ 实现特产商城系统
- ✨ 开发建言献策论坛
- ✨ 构建管理后台系统
- ✨ 集成数据统计分析
- ✨ 完善系统日志记录

---

**乡村振兴·新桃源智界** - 用科技助力乡村振兴，用智慧点亮美好未来！ 🌾✨
