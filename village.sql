-- ============================================================
-- 乡村振兴·智兴乡村平台 - 数据库初始化脚本
-- 数据库: village | MySQL 8.0+ | 字符集: utf8mb4
-- 说明: 本文件为项目唯一数据库初始化脚本，请勿拆分
--       包含全部建表、初始数据、视图、函数、存储过程和触发器
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 基础模块
-- ============================================================

-- ----------------------------
-- Table structure for address
-- ----------------------------
DROP TABLE IF EXISTS `address`;
CREATE TABLE `address`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `receiver_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '收货人姓名',
  `receiver_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '收货人电话',
  `province` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '省份',
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '城市',
  `district` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '区县',
  `detail_address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) NULL DEFAULT 0 COMMENT '是否默认地址：0否，1是',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '收货地址表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of address
-- ----------------------------
INSERT INTO `address` VALUES (1, 8, '李四', '13800138000', '湖南省', '长沙市', '岳麓区', '乡村路123号', 0, '2025-09-10 16:25:24', '2025-09-11 14:48:32', 0);
INSERT INTO `address` VALUES (2, 8, '李四', '13800138001', '湖南省', '常德市', '乡村振兴示范县', '田园生态景区附近', 1, '2025-09-10 16:25:24', '2025-09-11 14:48:32', 0);
INSERT INTO `address` VALUES (3, 8, '潇潇', '18276298374', '湖南省', '长沙市', '岳麓区', '地铁口旁边', 0, '2025-09-11 14:48:29', '2025-09-11 14:48:29', 0);
INSERT INTO `address` VALUES (4, 9, '潇潇', '18276287425', '湖北省', '武汉市', '江汉区', '地铁口附近', 1, '2025-09-11 16:44:34', '2025-09-11 16:44:36', 0);

-- ============================================================
-- 景点模块
-- ============================================================

-- ----------------------------
-- Table structure for attraction_categories
-- ----------------------------
DROP TABLE IF EXISTS `attraction_categories`;
CREATE TABLE `attraction_categories`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '分类名称',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分类描述',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分类图标',
  `sort_order` int(0) NULL DEFAULT 0 COMMENT '排序值',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '景点分类表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of attraction_categories
-- ----------------------------
INSERT INTO `attraction_categories` VALUES (1, '自然风光', '欣赏大自然的美景', '/icons/nature.png', 1, 1, '2025-09-09 10:19:20', '2025-09-09 10:19:20');
INSERT INTO `attraction_categories` VALUES (2, '人文古迹', '体验历史文化底蕴', '/icons/culture.png', 2, 1, '2025-09-09 10:19:20', '2025-09-09 10:19:20');
INSERT INTO `attraction_categories` VALUES (3, '农家乐', '体验田园生活', '/icons/farm.png', 3, 1, '2025-09-09 10:19:20', '2025-09-09 10:19:20');
INSERT INTO `attraction_categories` VALUES (4, '民宿客栈', '舒适的住宿体验', '/icons/hotel.png', 4, 1, '2025-09-09 10:19:20', '2025-09-09 10:19:20');

-- ----------------------------
-- Table structure for attractions
-- ----------------------------
DROP TABLE IF EXISTS `attractions`;
CREATE TABLE `attractions`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '景点ID',
  `amap_poi_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '高德地图POI ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '景点名称',
  `category_id` bigint(0) NOT NULL COMMENT '分类ID',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '景点描述',
  `cover_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '封面图片',
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '图片集合（JSON数组）',
  `panorama_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '360°全景图URL',
  `longitude` decimal(10, 6) NULL DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10, 6) NULL DEFAULT NULL COMMENT '纬度',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '详细地址',
  `traffic_guide` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '交通指引',
  `opening_hours` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '开放时间',
  `ticket_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '门票价格',
  `rating` decimal(3, 2) NULL DEFAULT 0.00 COMMENT '评分',
  `view_count` int(0) NULL DEFAULT 0 COMMENT '浏览次数',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `sort_order` int(0) NULL DEFAULT 0 COMMENT '排序值',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category_id`(`category_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_location`(`longitude`, `latitude`) USING BTREE,
  FULLTEXT INDEX `idx_address_search`(`address`, `description`)
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '景点信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of attractions
-- ----------------------------
INSERT INTO `attractions` VALUES (1, '田园生态景区', 1, '田园生态旅游区 ，简称田园生态旅游区，是位于乡村振兴示范县田园镇境内的旅游景区，田园生态旅游区总面积142.48平方千米，核心景区面积约20平方千米。\n田园生态始建于秦代，到唐宋时发展到鼎盛阶段，在元代时毁于战乱，明清以后又开始复兴。历代以来，陶渊明、李白、刘禹锡、苏轼、孟浩然、韩愈等大文豪都在此留下了许多珍贵的诗文和墨迹。田园生态在历史上就是中国古代道教圣地之一。', '/api/file/download/e0f3b9d2-120a-4b4e-b434-02d18750f757.jpg', '[\"/images/attractions/rural_1.jpg\",\"/images/attractions/rural_2.jpg\"]', '/panorama/rural_360.jpg', 111.436437, 28.781719, '田园生态风景区', '报团旅游或者自驾游都支持', '08:00-17:00', 80.00, 4.50, 1554, 1, 1, '2025-09-09 10:19:20', '2025-09-15 19:50:40', 0);
INSERT INTO `attractions` VALUES (2, '田园博览园', 1, '田园博览园位于生态岭，分为六大板块，包括田园生态牌楼、田园博览园、望乡岭水、果林、田园及生态村，共种植100多个品种，16450余株花树。每当春花盛开的季节，万亩花海，红云漂浮，赤霞腾飞，与沿溪松涛竹风映照，瑰丽多彩。 ', '/api/file/download/76ee38fc-be70-4747-8679-a8bd77c38d61.jpg', '[\"/images/attractions/village_1.jpg\",\"/images/attractions/village_2.jpg\"]', NULL, 111.443196, 28.790702, '田园博览园', '自驾游最佳，先到生态古镇', '09:00-17:30', 50.00, 4.30, 902, 1, 2, '2025-09-09 10:19:20', '2025-09-15 20:08:25', 0);
INSERT INTO `attractions` VALUES (4, '古禅寺', 1, '古禅寺又称古禅寺，位于翠屏山山腰，水府阁东北方向。明嘉靖《常德府志》载：“古禅寺，晋人建。”千年古刹，是田园生态有记载的最早建筑。公元1112年，宋徽宗钦赐御书“古禅寺”匾额，香火达到极盛，呈现“四十八层庵，走马关山门”的盛况。现于原址复建上、中、下三宫，道观宏敞，古木垂荫，蔚然深秀，被誉为“江南第一宫”。', '/api/file/download/a4e53f65-512c-4555-af87-6162a6ea3abc.jpg', '[\"/images/attractions/rural_1.jpg\",\"/images/attractions/rural_2.jpg\"]', NULL, 111.435865, 28.774817, '古禅寺', '自驾游，和亲朋好友最佳', '06:00-18:00', 25.00, 4.20, 120, 1, 3, '2025-09-08 10:30:00', '2025-09-15 20:11:05', 0);
INSERT INTO `attractions` VALUES (5, '生态古镇', 2, '生态古镇以江南风情的精品园林搭配浓郁潇湘地方特色的古建筑艺术为核心依托，完美展现传承数千年的湖湘民俗文化。古镇既能领略明清建筑文化，又有江南小桥流水的韵味。古戏台、姻缘楼、综艺馆、城隍庙、傩堂、伏波楼美景不断；游玩之间享 受不一样的江南流水。正是那“游山玩水好风光，寻花问柳在古镇”。', '/api/file/download/fa396be7-d06b-4e18-b90a-a32f65388ab0.jpg', '[\"/images/attractions/village_1.jpg\",\"/images/attractions/village_2.jpg\"]', NULL, 111.425859, 28.775866, '生态古镇', '自驾游最佳、穷游富游不如 少年游', '05:00-20:00', 10.00, 4.00, 85, 1, 4, '2025-09-10 14:20:00', '2025-09-15 20:13:07', 0);
INSERT INTO `attractions` VALUES (6, '碧云湖', 1, '碧云湖是以东晋大诗人陶渊明自号“五柳先生”而命名。它位于望乡岭与翠屏山之间，以湖水为纽带，实现两山之间的天然融合。五里湖两岸有刘禹锡的陋室、“乡村佳致”碑亭等景点。', '/api/file/download/cca077e5-f8fe-4a9c-9e50-9dd968534dc6.jpg', '[\"/images/attractions/rural_1.jpg\",\"/images/attractions/rural_2.jpg\"]', NULL, 111.440585, 28.792419, '碧云湖', '步行即可', '08:00-17:00', 35.00, 4.60, 200, 1, 5, '2025-09-13 09:15:00', '2025-09-15 20:16:52', 0);
INSERT INTO `attractions` VALUES (7, '幽兰谷', 1, '幽兰谷，土地平旷，屋舍俨然，有良田美池桑竹之属。幽兰谷南临幽兰溪，北接望乡岭，通谷游线约3.7千米，是天然氧吧的实景再现。谷内由幽兰洞、洞天驿馆、寰楼、天工六艺坊、扶疏园，烟雨楼等20多个景点组成。', '/api/file/download/9c9138a3-5ecd-4d60-b4d0-cf132c782607.jpg', '[\"/images/attractions/village_1.jpg\",\"/images/attractions/village_2.jpg\"]', NULL, 111.442558, 28.787958, '乡村振兴示范县幽兰谷', '自驾游、漫步皆可', '24小时', 20.00, 4.20, 1, 1, 10, '2025-09-15 14:56:16', '2025-09-15 20:37:47', 0);
INSERT INTO `attractions` VALUES (8, '望乡岭', 1, '望乡岭是纪念并体现陶渊明以及《田园诗并序》的“陶公山”，体现历朝历代隐逸文化的“隐士山”，更是留下多位文人墨客足迹的“名人山”，展现诗词楹联碑刻之韵的“国宝山”。', '/api/file/download/d3121bc9-71ae-40b2-9012-3ba39790209c.jpg', '[\"/images/attractions/rural_1.jpg\",\"/images/attractions/rural_2.jpg\"]', NULL, 111.442522, 28.781825, '乡村振兴示范县望乡岭', '适合漫步', '08:00-18:00', 30.00, 4.10, 0, 1, 11, '2025-09-15 14:56:16', '2025-09-15 20:21:29', 0);
INSERT INTO `attractions` VALUES (9, '翠屏山', 1, '翠屏山又名黄闻山，位于沅江南岸。这里是生态田园福地的源头，自东晋起便是沅水流域道教文化中心。山中有水府阁、古禅寺、古禅书院三大建筑群落。来到翠屏山，既可朝圣仙气缭绕的“古禅香火”，又可领略古潇湘八景之一的“渔村夕照”妙境。山水人文融于一体，开田园生态方外之“境”。', '/api/file/download/576066cb-9ec0-42b0-bee5-e0741324ce8e.jpg', '[\"/images/attractions/village_1.jpg\",\"/images/attractions/village_2.jpg\"]', NULL, 111.434906, 28.777185, '乡村振兴示范县翠屏山', '漫步即可', '09:00-17:00', 20.00, 3.90, 0, 1, 12, '2025-09-15 14:56:16', '2025-09-15 20:23:13', 0);

-- ----------------------------
-- Table structure for tour_routes
-- ----------------------------
DROP TABLE IF EXISTS `route_items`;
DROP TABLE IF EXISTS `tour_routes`;
CREATE TABLE `tour_routes` (
  `id`              BIGINT NOT NULL AUTO_INCREMENT COMMENT '路线ID',
  `name`            VARCHAR(100) NOT NULL COMMENT '路线名称',
  `cover_image`     VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
  `description`     TEXT COMMENT '路线描述',
  `days`            INT NOT NULL DEFAULT 1 COMMENT '行程天数',
  `difficulty`      VARCHAR(20) NOT NULL DEFAULT 'easy' COMMENT '难度: easy/medium/hard',
  `suitable_crowd`  VARCHAR(100) DEFAULT NULL COMMENT '适合人群',
  `budget_min`      DECIMAL(10,2) DEFAULT 0.00 COMMENT '最低预算',
  `budget_max`      DECIMAL(10,2) DEFAULT 0.00 COMMENT '最高预算',
  `tags`            VARCHAR(500) DEFAULT NULL COMMENT '标签(逗号分隔)',
  `tips`            TEXT COMMENT '旅行小贴士',
  `view_count`      INT DEFAULT 0 COMMENT '浏览次数',
  `rating`          DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分',
  `rating_count`    INT DEFAULT 0 COMMENT '评价人数',
  `is_official`     TINYINT(1) DEFAULT 0 COMMENT '是否官方推荐',
  `status`          TINYINT(1) DEFAULT 1 COMMENT '状态: 0禁用 1启用',
  `sort_order`      INT DEFAULT 0 COMMENT '排序值',
  `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`         TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_difficulty` (`difficulty`),
  INDEX `idx_is_official` (`is_official`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='旅游路线表';

-- ----------------------------
-- Table structure for route_items
-- ----------------------------
CREATE TABLE `route_items` (
  `id`                 BIGINT NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `route_id`           BIGINT NOT NULL COMMENT '关联路线ID',
  `day_number`         INT NOT NULL DEFAULT 1 COMMENT '第几天',
  `sort_order`         INT NOT NULL DEFAULT 1 COMMENT '当天排序',
  `attraction_id`      BIGINT NOT NULL COMMENT '关联景点ID',
  `suggested_duration` VARCHAR(50) DEFAULT NULL COMMENT '建议游玩时长',
  `transport_method`   VARCHAR(100) DEFAULT NULL COMMENT '交通方式',
  `note`               VARCHAR(500) DEFAULT NULL COMMENT '小贴士',
  `created_at`         DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_route_id` (`route_id`),
  INDEX `idx_attraction_id` (`attraction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='路线行程明细表';

-- ----------------------------
-- Records of tour_routes
-- ----------------------------
INSERT INTO `tour_routes` (`id`, `name`, `cover_image`, `description`, `days`, `difficulty`, `suitable_crowd`, `budget_min`, `budget_max`, `tags`, `tips`, `view_count`, `rating`, `rating_count`, `is_official`, `status`, `sort_order`) VALUES
(1, '田园经典一日游',
 '/api/file/download/e0f3b9d2-120a-4b4e-b434-02d18750f757.jpg',
 '一天玩转田园生态核心景区，从幽兰溪入谷到碧云湖畔，感受陶渊明笔下的绿水青山。适合时间有限但想深度体验的游客。',
 1, 'easy', '全家出游、朋友结伴',
 150.00, 300.00,
 '经典,一日游,田园生态,家庭出游',
 '<ul><li><strong>最佳季节：</strong>3月—4月春花盛开时最美，秋季也是不错的游览季节。</li><li><strong>穿着建议：</strong>景区内步行较多，建议穿舒适运动鞋。</li><li><strong>美食推荐：</strong>客家擂茶、常德米粉、生态散养鸡都是当地特色。</li><li><strong>交通方式：</strong>自驾导航至"田园生态景区"，有大型停车场；或从常德市区乘坐旅游专线大巴。</li><li><strong>建议携带：</strong>防晒用品、饮用水、雨具（山区天气多变）。</li></ul>',
 0, 4.80, 0, 1, 1, 1),
(2, '乡村文化两日游',
 '/api/file/download/fa396be7-d06b-4e18-b90a-a32f65388ab0.jpg',
 '两天深度游览田园生态文化精髓。第一天探索望乡岭与幽兰谷的自然风光，第二天感受道教文化与古镇风情。既有山水之美，又有人文底蕴。',
 2, 'medium', '文化爱好者、摄影爱好者',
 300.00, 600.00,
 '文化,两日游,道教,古镇,摄影',
 '<ul><li><strong>住宿建议：</strong>可选择生态古镇内的特色民宿，体验潇湘古建筑风情。</li><li><strong>行程节奏：</strong>第一天较为充实，建议早起出发；第二天可悠闲游览。</li><li><strong>摄影推荐：</strong>碧云湖日出、翠屏山"渔村夕照"、古镇夜景都是绝佳取景点。</li><li><strong>特色体验：</strong>古禅寺可体验道教文化，古镇有傩戏表演。</li><li><strong>美食推荐：</strong>古镇内有乡村特色小吃一条街，推荐尝试擂茶和酱板鸭。</li></ul>',
 0, 4.70, 0, 1, 1, 2),
(3, '乡村深度三日游',
 '/api/file/download/76ee38fc-be70-4747-8679-a8bd77c38d61.jpg',
 '三天时间深度探索田园生态旅游区的每一个角落。从田园生态核心景区到田园博览园，从道教圣地古禅寺到翠屏山的山水画卷，不留遗憾。',
 3, 'easy', '深度旅行者、家庭出游',
 500.00, 1000.00,
 '深度游,三日游,自然风光,人文历史,家庭',
 '<ul><li><strong>行程亮点：</strong>幽兰谷再现《田园生态记》实景，田园博览园百种花卉竞相绽放。</li><li><strong>住宿建议：</strong>建议两晚住在生态古镇，体验不同的潇湘民宿风格。</li><li><strong>省钱攻略：</strong>购买景区联票可节省门票费用，提前在网上预订更优惠。</li><li><strong>穿着建议：</strong>三天行程步行量较大，务必穿舒适的运动鞋或登山鞋。</li><li><strong>特别提醒：</strong>春季赏花节期间游客较多，建议提前预订住宿和门票。</li><li><strong>周边推荐：</strong>如有时间可顺道游览柳叶湖风景区，距离约40分钟车程。</li></ul>',
 0, 4.90, 0, 1, 1, 3);

-- ----------------------------
-- Records of route_items
-- ----------------------------
INSERT INTO `route_items` (`route_id`, `day_number`, `sort_order`, `attraction_id`, `suggested_duration`, `transport_method`, `note`) VALUES
(1, 1, 1, 1, '3小时',  NULL,                  '上午游览核心景区，感受《田园生态记》原型地'),
(1, 1, 2, 7, '2小时',  '步行约15分钟',         '午饭后漫步幽兰谷，体验"土地平旷，屋舍俨然"'),
(1, 1, 3, 6, '1.5小时', '步行约10分钟',        '傍晚沿碧云湖散步，欣赏湖光山色');
INSERT INTO `route_items` (`route_id`, `day_number`, `sort_order`, `attraction_id`, `suggested_duration`, `transport_method`, `note`) VALUES
(2, 1, 1, 1, '3小时',  NULL,                       '上午深度游览田园生态核心景区'),
(2, 1, 2, 8, '2小时',  '步行约10分钟',              '下午登望乡岭，品味诗词碑刻'),
(2, 1, 3, 7, '2小时',  '步行约15分钟',              '傍晚漫步幽兰谷，感受田园风光'),
(2, 2, 1, 4, '1.5小时', NULL,                      '上午参拜古禅寺，体验道教文化'),
(2, 2, 2, 9, '2小时',  '步行约20分钟',              '登翠屏山，俯瞰沅江，赏"渔村夕照"'),
(2, 2, 3, 5, '2小时',  '驾车约15分钟',             '下午逛生态古镇，品尝当地美食');
INSERT INTO `route_items` (`route_id`, `day_number`, `sort_order`, `attraction_id`, `suggested_duration`, `transport_method`, `note`) VALUES
(3, 1, 1, 1, '3小时',  NULL,                       '上午：田园生态核心景区深度游'),
(3, 1, 2, 2, '2小时',  '驾车约10分钟',             '下午：百种花卉竞相绽放'),
(3, 1, 3, 6, '1.5小时', '驾车约10分钟',            '傍晚：碧云湖畔散步观日落'),
(3, 2, 1, 8, '2.5小时', NULL,                      '上午：登望乡岭，赏诗词楹联'),
(3, 2, 2, 7, '2小时',  '步行约15分钟',              '下午：幽兰谷实景体验'),
(3, 2, 3, 5, '2小时',  '驾车约15分钟',             '晚上：古镇夜景，品尝特色小吃'),
(3, 3, 1, 9, '2小时',  NULL,                       '上午：翠屏山登高望远'),
(3, 3, 2, 4, '1.5小时', '步行约20分钟',            '参拜古禅寺"江南第一宫"');

-- ============================================================
-- 活动模块
-- ============================================================

DROP TABLE IF EXISTS `activity_registrations`;
DROP TABLE IF EXISTS `activities`;

CREATE TABLE `activities` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '活动ID',
  `title` varchar(120) NOT NULL COMMENT '活动标题',
  `cover_images` text COMMENT '封面图列表(JSON)',
  `description` text COMMENT '活动描述',
  `category` varchar(50) NOT NULL COMMENT '活动分类',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NOT NULL COMMENT '结束时间',
  `location` varchar(255) NOT NULL COMMENT '活动地点',
  `organizer` varchar(120) DEFAULT NULL COMMENT '主办方',
  `contact_phone` varchar(30) DEFAULT NULL COMMENT '联系电话',
  `fee` decimal(10,2) DEFAULT 0.00 COMMENT '报名费用',
  `max_participants` int DEFAULT 0 COMMENT '最大人数，0表示不限',
  `current_participants` int DEFAULT 0 COMMENT '当前报名人数',
  `registration_deadline` datetime DEFAULT NULL COMMENT '报名截止时间',
  `status` varchar(30) DEFAULT 'registering' COMMENT '活动状态',
  `images` text COMMENT '详情图(JSON)',
  `tags` text COMMENT '标签(JSON)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='乡村活动表';

CREATE TABLE `activity_registrations` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '报名ID',
  `activity_id` bigint NOT NULL COMMENT '活动ID',
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `contact_name` varchar(60) NOT NULL COMMENT '联系人姓名',
  `contact_phone` varchar(30) NOT NULL COMMENT '联系电话',
  `participant_count` int NOT NULL DEFAULT 1 COMMENT '参加人数',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `status` varchar(30) NOT NULL DEFAULT 'pending' COMMENT '报名状态',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_activity_id` (`activity_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动报名表';

INSERT INTO `activities` (`id`, `title`, `cover_images`, `description`, `category`, `start_time`, `end_time`, `location`, `organizer`, `contact_phone`, `fee`, `max_participants`, `current_participants`, `registration_deadline`, `status`, `images`, `tags`, `created_at`, `updated_at`, `deleted`) VALUES
(1, '2026乡村生态文化节', '["https://picsum.photos/seed/act1a/800/500","https://picsum.photos/seed/act1b/800/500"]', '一年一度的乡村生态文化节盛大开幕，包含花海摄影、乡村美食品鉴、民俗巡游等丰富活动。', 'festival', '2026-04-20 09:00:00', '2026-05-05 18:00:00', '示范县田园生态景区', '示范县文化和旅游局', '0736-6688888', 0.00, 500, 356, '2026-04-30 23:59:00', 'ongoing', '["https://picsum.photos/seed/act1c/400/300"]', '["花海","摄影","美食"]', '2026-03-15 10:00:00', '2026-03-15 10:00:00', 0),
(2, '春日茶园采摘体验', '["https://picsum.photos/seed/act2a/800/500"]', '亲手采摘明前茶，跟随茶农学习杀青、揉捻、烘干等传统制茶工艺。', 'picking', '2026-05-10 08:00:00', '2026-05-10 17:00:00', '示范县云岭镇高山茶园', '示范县茶叶合作社', '0736-6551234', 128.00, 30, 22, '2026-05-08 23:59:00', 'registering', '["https://picsum.photos/seed/act2b/400/300"]', '["茶叶","采摘","制茶体验"]', '2026-03-20 09:00:00', '2026-03-20 09:00:00', 0),
(3, '非遗竹编手作课堂', '["https://picsum.photos/seed/act3a/800/500"]', '跟随非遗传承人学习竹编技艺，从选竹、劈篾到编织成型，全程沉浸式体验。', 'workshop', '2026-05-18 09:00:00', '2026-05-18 12:00:00', '示范县绿野镇文化站', '示范县非遗保护中心', '0736-6623456', 68.00, 15, 8, '2026-05-16 23:59:00', 'registering', '[]', '["非遗","竹编","手作"]', '2026-03-28 10:30:00', '2026-03-28 10:30:00', 0),
(4, '乡村美食市集', '["https://picsum.photos/seed/act4a/800/500"]', '五一特别企划，汇集各乡镇特色美食，现场有厨艺比拼与大众投票。', 'market', '2026-05-01 10:00:00', '2026-05-03 20:00:00', '示范县文化广场', '示范县商务局', '0736-6634567', 0.00, 0, 0, NULL, 'registering', '[]', '["美食","市集","五一"]', '2026-04-01 11:00:00', '2026-04-01 11:00:00', 0),
(5, '美丽乡村摄影大赛', '["https://picsum.photos/seed/act5a/800/500"]', '用镜头记录乡村之美，设一等奖、二等奖和三等奖多个奖项。', 'competition', '2026-04-10 00:00:00', '2026-06-10 23:59:00', '示范县全域', '示范县文联', '0736-6645678', 0.00, 200, 156, '2026-05-20 23:59:00', 'ongoing', '[]', '["摄影","比赛","风光"]', '2026-03-10 09:30:00', '2026-03-10 09:30:00', 0),
(6, '端午龙舟文化节', '["https://picsum.photos/seed/act6a/800/500"]', '端午佳节龙舟竞渡，现场还有包粽子、编五彩绳、挂艾草等传统民俗互动。', 'festival', '2026-05-31 08:00:00', '2026-05-31 18:00:00', '示范县碧江段', '示范县体育局', '0736-6667890', 0.00, 1000, 234, '2026-05-29 23:59:00', 'registering', '[]', '["端午","龙舟","民俗"]', '2026-04-05 15:00:00', '2026-04-05 15:00:00', 0);

INSERT INTO `activity_registrations` (`id`, `activity_id`, `user_id`, `contact_name`, `contact_phone`, `participant_count`, `remark`, `status`, `created_at`, `updated_at`, `deleted`) VALUES
(1, 2, NULL, '张三', '13800138001', 2, '希望安排制茶体验', 'confirmed', '2026-04-21 09:00:00', '2026-04-21 09:00:00', 0),
(2, 2, NULL, '李四', '13800138002', 1, '', 'confirmed', '2026-04-22 10:00:00', '2026-04-22 10:00:00', 0),
(3, 3, NULL, '王五', '13800138003', 3, '带两个孩子参加', 'pending', '2026-04-23 11:00:00', '2026-04-23 11:00:00', 0),
(4, 5, NULL, '赵六', '13800138004', 1, '专业摄影师', 'confirmed', '2026-04-24 12:00:00', '2026-04-24 12:00:00', 0);

-- ============================================================
-- 论坛模块
-- ============================================================

-- ----------------------------
-- Table structure for forum_comment_likes
-- ----------------------------
DROP TABLE IF EXISTS `forum_comment_likes`;
CREATE TABLE `forum_comment_likes`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `comment_id` bigint(0) NOT NULL COMMENT '评论ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_comment_user`(`comment_id`, `user_id`) USING BTREE,
  INDEX `idx_comment_id`(`comment_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '评论点赞表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of forum_comment_likes
-- ----------------------------

-- ----------------------------
-- Table structure for forum_comments
-- ----------------------------
DROP TABLE IF EXISTS `forum_comments`;
CREATE TABLE `forum_comments`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `post_id` bigint(0) NOT NULL COMMENT '帖子ID',
  `user_id` bigint(0) NOT NULL COMMENT '评论用户ID',
  `parent_id` bigint(0) NULL DEFAULT NULL COMMENT '父评论ID，用于回复功能',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评论内容',
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '图片集合（JSON数组）',
  `like_count` int(0) NULL DEFAULT 0 COMMENT '点赞数',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：0待审核，1已通过，2已拒绝',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_post_id`(`post_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '论坛评论表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of forum_comments
-- ----------------------------
INSERT INTO `forum_comments` VALUES (1, 1, 8, NULL, '这个建议很好，我们村的路确实需要修缮', NULL, 2, 1, '2025-09-12 11:25:00', '2025-09-12 11:25:00', 0);
INSERT INTO `forum_comments` VALUES (2, 1, 9, NULL, '支持这个建议，希望政府能够重视', NULL, 1, 1, '2025-09-12 11:26:00', '2025-09-12 11:26:00', 0);
INSERT INTO `forum_comments` VALUES (3, 1, 8, 1, '是的，特别是雨季的时候路况很差', NULL, 0, 1, '2025-09-12 11:27:00', '2025-09-12 11:27:00', 0);
INSERT INTO `forum_comments` VALUES (14, 6, 9, NULL, '生态农业是未来发展方向', NULL, 2, 1, '2025-09-08 11:00:00', '2025-09-08 11:00:00', 0);
INSERT INTO `forum_comments` VALUES (15, 6, 8, NULL, '可以先试点一些有机蔬菜', NULL, 3, 1, '2025-09-08 12:30:00', '2025-09-08 12:30:00', 0);
INSERT INTO `forum_comments` VALUES (16, 7, 8, NULL, '文化中心确实需要，老人小孩都需要', NULL, 2, 1, '2025-09-10 15:00:00', '2025-09-10 15:00:00', 0);
INSERT INTO `forum_comments` VALUES (17, 7, 9, NULL, '可以申请一些文化惠民资金', NULL, 1, 1, '2025-09-10 16:15:00', '2025-09-10 16:15:00', 0);
INSERT INTO `forum_comments` VALUES (18, 8, 9, NULL, '路灯太少了，晚上不敢出门', NULL, 1, 1, '2025-09-12 20:00:00', '2025-09-12 20:00:00', 0);
INSERT INTO `forum_comments` VALUES (19, 8, 8, NULL, '特别是老年人晚上散步很不安全', NULL, 0, 1, '2025-09-12 20:30:00', '2025-09-12 20:30:00', 0);
INSERT INTO `forum_comments` VALUES (20, 9, 8, NULL, '民宿发展前景很好', NULL, 3, 1, '2025-09-13 17:00:00', '2025-09-13 17:00:00', 0);
INSERT INTO `forum_comments` VALUES (21, 9, 9, NULL, '我家房子可以改造成民宿', NULL, 2, 1, '2025-09-13 18:00:00', '2025-09-13 18:00:00', 0);

-- ----------------------------
-- Table structure for forum_post_likes
-- ----------------------------
DROP TABLE IF EXISTS `forum_post_likes`;
CREATE TABLE `forum_post_likes`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `post_id` bigint(0) NOT NULL COMMENT '帖子ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_post_user`(`post_id`, `user_id`) USING BTREE,
  INDEX `idx_post_id`(`post_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '帖子点赞表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of forum_post_likes
-- ----------------------------

-- ----------------------------
-- Table structure for forum_posts
-- ----------------------------
DROP TABLE IF EXISTS `forum_posts`;
CREATE TABLE `forum_posts`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '帖子标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '帖子内容',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '建议类型：environment-环境问题，infrastructure-基础设施，agriculture-农业发展，tourism-旅游发展，education-教育文化，other-其他',
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '图片集合（JSON数组）',
  `user_id` bigint(0) NOT NULL COMMENT '发帖用户ID',
  `status` tinyint(1) NULL DEFAULT 0 COMMENT '审核状态：0待审核，1已通过，2已拒绝',
  `is_top` tinyint(1) NULL DEFAULT 0 COMMENT '是否置顶：0否，1是',
  `is_featured` tinyint(1) NULL DEFAULT 0 COMMENT '是否推荐：0否，1是',
  `view_count` int(0) NULL DEFAULT 0 COMMENT '浏览次数',
  `like_count` int(0) NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` int(0) NULL DEFAULT 0 COMMENT '评论数',
  `admin_reply` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '管理员回复',
  `admin_reply_time` datetime(0) NULL DEFAULT NULL COMMENT '管理员回复时间',
  `reject_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '拒绝原因',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE,
  INDEX `idx_is_top`(`is_top`) USING BTREE,
  INDEX `idx_is_featured`(`is_featured`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '论坛帖子表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of forum_posts
-- ----------------------------
INSERT INTO `forum_posts` VALUES (1, '关于村道路修建的建议', '我们村的主要道路年久失修，雨天容易积水，希望能够重新铺设沥青路面，提高村民出行的便利性。', 'infrastructure', '[\"/api/file/download/0bd61ae7-fd77-4e8b-8e1d-29360eb47638.jpg\"]', 9, 1, 0, 0, 27, 1, 3, NULL, NULL, NULL, '2025-09-12 11:21:25', '2025-09-15 20:51:13', 0);
INSERT INTO `forum_posts` VALUES (6, '建议发展生态农业', '我们可以发展有机农业，既保护环境又增加收入', 'agriculture', '[]', 8, 1, 0, 1, 36, 4, 2, '这个建议很有前瞻性，我们会认真考虑', '2025-09-08 15:30:00', NULL, '2025-09-08 10:15:00', '2025-09-15 21:03:05', 0);
INSERT INTO `forum_posts` VALUES (7, '希望增设文化活动中心', '村里缺少文化娱乐设施，建议建设文化活动中心', 'education', '[]', 9, 1, 0, 0, 29, 3, 2, NULL, NULL, NULL, '2025-09-10 14:20:00', '2025-09-15 14:19:48', 0);
INSERT INTO `forum_posts` VALUES (8, '改善村内照明设施', '夜晚道路较暗，建议增加路灯照明', 'infrastructure', '[]', 8, 2, 0, 0, 17, 0, 2, '', '2025-09-15 20:54:10', '不建议', '2025-09-12 19:45:00', '2025-09-15 20:54:10', 0);
INSERT INTO `forum_posts` VALUES (9, '推广乡村民宿发展', '利用我们的自然优势发展民宿产业', 'tourism', '[\"/api/file/download/6f83e44e-d4ca-4e45-8c0c-bc3ce81c4648.jpg\"]', 9, 1, 1, 0, 53, 5, 2, '', '2025-09-15 21:02:36', '123', '2025-09-13 16:30:00', '2025-09-15 21:04:17', 0);

-- ============================================================
-- 资讯模块
-- ============================================================

-- ----------------------------
-- Table structure for news
-- ----------------------------
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '资讯ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标题',
  `summary` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '摘要',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '内容',
  `cover_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '封面图片',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分类：news-新闻，policy-政策，activity-活动',
  `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '作者',
  `source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '来源',
  `view_count` int(0) NULL DEFAULT 0 COMMENT '浏览次数',
  `is_top` tinyint(1) NULL DEFAULT 0 COMMENT '是否置顶：0否，1是',
  `is_featured` tinyint(1) NULL DEFAULT 0 COMMENT '是否推荐：0否，1是',
  `publish_time` datetime(0) NULL DEFAULT NULL COMMENT '发布时间',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：0草稿，1已发布，2已下线',
  `sort_order` int(0) NULL DEFAULT 0 COMMENT '排序值',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_publish_time`(`publish_time`) USING BTREE,
  INDEX `idx_featured`(`is_featured`) USING BTREE,
  INDEX `idx_top`(`is_top`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '资讯表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of news
-- ----------------------------
INSERT INTO `news` VALUES (1, '乡村振兴示范县获评全国乡村振兴示范县', '我县在乡村振兴工作中取得显著成效，获得国家级荣誉', '<p>近日，乡村振兴示范县被农业农村部评为全国乡村振兴示范县...</p>', '/api/file/download/21d24a9d-b977-4007-ac15-a5a944b9fe77.jpg', 'news', '县政府办公室', '乡村日报', 502, 0, 1, '2025-09-08 22:22:28', 1, 1, '2025-09-09 10:19:20', '2025-09-15 20:47:20', 0);
INSERT INTO `news` VALUES (2, '春季赏花节即将开幕', '一年一度的赏花节将于3月15日盛大开幕，欢迎各界朋友前来赏花', '<p>春暖花开，春花盛放。我县第十届赏花节将于3月15日...</p>', '/api/file/download/d30de0e4-a0d3-4331-89c8-6d719d32cb6c.jpg', 'activity', '旅游局', '乡村旅游', 800, 0, 1, '2025-09-10 06:34:51', 1, 2, '2025-09-09 10:19:20', '2025-09-15 20:43:02', 0);
INSERT INTO `news` VALUES (5, '创新改革实打实 便民服务心贴心——汉县不动产登记中心工作纪实', '县政府投资建设现代化智慧农业示范基地', '8月26日是汉寿县不动产登记中心挂牌成立9周年的日子。9年来，县不动产登记中心在汉寿县委县政府和县自然资源局党组的坚强领导下，在省、市主管部门及全县各部门的支持配合下，始终秉持“便民利民、高效服务、改革创新”的理念，以实实在在的行动推动不动产登记工作提质增效，赢得社会各界广泛好评。\n<br/>\n打造优质服务窗口，提升群众办事体验\n<br/>\n县不动产登记中心自成立以来，高度重视服务窗口建设，推行着装规范、微笑服务及普通话接待。服务大厅内设有醒目的办事指南，便于群众取阅。近年来，县不动产登记中心持续优化办理流程，将原有按业务分类受理的模式，升级为“一窗受理、并行办理”的综合服务，大幅减少群众排队次数。经过5次业务大提速，登记办理时限由法定的30个工作日压缩至2个工作日以内。\n<br/>\n2023年，县不动产登记中心联合县数据局、县税务局等部门出台《汉寿县不动产登记“高效办成一件事”实施方案》，设立“一件事”专窗，整合不动产登记、交易以及水、电、气过户等事项，推行“一表申请”模式，申请材料精简至5份。截至目前，已联动办理860笔不动产登记及水、电、气联动过户业务。\n<br/>\n此外，县不动产登记中心积极推动党建与业务深度融合，打造“不动产登记+党建”服务品牌，设立“党员先锋岗”和“学雷锋上门服务小组”，开展工作日“早开晚关”、周末“不打烊”服务，并实行主任值班和延时服务机制，切实为群众提供便利，实现登记质量与服务作风“双提升”。9年来，县不动产登记中心荣获多项荣誉。\n<br/>\n深化制度改革，破解群众急难愁盼\n<br/>\n作为自然资源领域改革的前沿阵地，县不动产登记中心积极落实国家各项惠民政策，持续推进制度创新。2020年，全省农村宅基地和集体建设用地房地一体确权登记试点工作在汉寿开展，县不动产登记中心积极探索，形成可复制、可推广的经验做法。\n<br/>\n同时，全县新建商品房实现“交房即交证”常态化，从根本上预防“办证难”问题。自2020年以来，县不动产登记中心负责人带头攻坚，成功化解锦阳丰瑞、东方美景等34个楼盘存在的问题，为7265户群众解决不动产登记历史遗留难题。', '/api/file/download/6ede5435-3139-46e0-b823-831b392a0eb2.jpg', 'policy', '黎自来 通讯员 童坤 施祥 高昆明', '常德日报', 95, 1, 1, '2025-09-06 17:20:00', 1, 5, '2025-09-08 09:20:00', '2025-09-15 20:47:10', 0);
INSERT INTO `news` VALUES (6, '“常德好物”亮相长沙', '汉寿禾田甲食品有限公司等企业在长沙市举办了“常德好物”专场推介活动。', '日前，市商务局以2025年“德商恳谈会—长沙行”活动为契机，组织湖南中烟工业有限责任公司、湖南德山酒业有限公司、湖南武陵红茶业有限公司、湖南湘佳牧业股份有限公司、湖南鑫三香常德米粉集团有限公司、汉寿禾田甲食品有限公司等企业在长沙市举办了“常德好物”专场推介活动。\n<br/>\n推介会现场，参加活动的各企业携核心产品精彩亮相。“德酱”系列白酒、“武陵红”茶、“湘佳黑猪”肉制品、“鑫三香”常德米粉、“汉寿甲鱼”等一系列具有常德地理标志和地域特色的产品吸引了大批企业家及消费者的广泛关注。活动现场洽谈氛围浓厚，有效提升了常德地标优质产品的知名度和影响力。\n<br/>\n此次活动是常德市深化区域合作、拓展消费市场的重要举措之一，不仅为常德优质产品搭建了对外展示的窗口，也为两地企业进一步合作提供了良好平台。下一步，市商务局将继续依托各类展会、推介会等活动载体，推动更多“常德造”“常德产”名优特产品走出湖南、走向全国、迈入国际，助力全市经济高质量发展。', '/api/file/download/da79da85-97e0-4948-91f2-e568453c6aa4.jpg', 'policy', '刘颂 通讯员 代乐', '常德日报', 158, 1, 1, '2025-09-10 08:30:00', 1, 6, '2025-09-10 16:30:00', '2025-09-15 20:47:16', 0);
INSERT INTO `news` VALUES (7, '农产品电商平台上线', '县域农产品电商平台正式上线运营', '<p>为拓宽农产品销售渠道...</p>', '/api/file/download/70c87520-8e11-438e-b316-e8ef22958f08.jpg', 'news', '商务局', '乡村电商', 236, 0, 0, '2025-09-12 03:45:00', 1, 7, '2025-09-12 11:45:00', '2025-09-15 20:46:56', 0);
INSERT INTO `news` VALUES (8, '生态环境治理成效显著', '全县生态环境质量持续改善', '<p>今年以来，我县大力推进生态环境治理...</p>', '/api/file/download/f456f189-cfe0-4cab-92af-6a34af2add39.jpg', 'news', '环保局', '乡村环保', 178, 0, 1, '2025-09-14 06:10:00', 1, 8, '2025-09-14 14:10:00', '2025-09-15 20:48:05', 0);

-- ============================================================
-- 订单模块
-- ============================================================

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `order_id` bigint(0) NOT NULL COMMENT '订单ID',
  `product_id` bigint(0) NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品名称',
  `product_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品图片',
  `product_price` decimal(10, 2) NOT NULL COMMENT '商品单价',
  `quantity` int(0) NOT NULL COMMENT '购买数量',
  `total_price` decimal(10, 2) NOT NULL COMMENT '小计金额',
  `product_origin` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品产地',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order_id`(`order_id`) USING BTREE,
  INDEX `idx_product_id`(`product_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 32 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '订单明细表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (1, 1, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '乡村振兴示范县', '2025-09-11 11:08:39');
INSERT INTO `order_items` VALUES (2, 2, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '乡村振兴示范县', '2025-09-11 11:08:40');
INSERT INTO `order_items` VALUES (3, 3, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '乡村振兴示范县', '2025-09-11 11:08:41');
INSERT INTO `order_items` VALUES (4, 3, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '乡村振兴示范县', '2025-09-11 11:08:41');
INSERT INTO `order_items` VALUES (5, 4, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '乡村振兴示范县', '2025-09-11 11:08:42');
INSERT INTO `order_items` VALUES (6, 5, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '乡村振兴示范县', '2025-09-11 11:08:43');
INSERT INTO `order_items` VALUES (7, 6, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 2, 136.00, '乡村振兴示范县', '2025-09-11 11:28:11');
INSERT INTO `order_items` VALUES (8, 6, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 3, 105.00, '乡村振兴示范县', '2025-09-11 11:28:11');
INSERT INTO `order_items` VALUES (9, 7, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '乡村振兴示范县', '2025-09-11 11:30:06');
INSERT INTO `order_items` VALUES (10, 8, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 2, 136.00, '乡村振兴示范县', '2025-09-11 12:43:44');
INSERT INTO `order_items` VALUES (11, 9, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 2, 136.00, '乡村振兴示范县', '2025-09-11 12:45:40');
INSERT INTO `order_items` VALUES (12, 10, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '乡村振兴示范县', '2025-09-11 12:48:59');
INSERT INTO `order_items` VALUES (13, 11, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 2, 136.00, '乡村振兴示范县', '2025-09-11 12:50:22');
INSERT INTO `order_items` VALUES (14, 12, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 3, 204.00, '乡村振兴示范县', '2025-09-11 12:52:15');
INSERT INTO `order_items` VALUES (15, 13, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 2, 70.00, '乡村振兴示范县', '2025-09-11 13:02:38');
INSERT INTO `order_items` VALUES (16, 14, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '乡村振兴示范县', '2025-09-11 13:53:38');
INSERT INTO `order_items` VALUES (17, 15, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '乡村振兴示范县', '2025-09-11 16:44:55');
INSERT INTO `order_items` VALUES (18, 16, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 2, 70.00, '乡村振兴示范县', '2025-09-11 17:36:31');
INSERT INTO `order_items` VALUES (19, 17, 1, '山野土蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '乡村振兴示范县', '2025-09-11 17:39:09');
INSERT INTO `order_items` VALUES (20, 18, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '乡村振兴示范县', '2025-09-11 17:44:18');
INSERT INTO `order_items` VALUES (21, 19, 3, '高山云雾茶', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 128.00, 1, 128.00, '乡村振兴示范县', '2025-09-07 10:30:01');
INSERT INTO `order_items` VALUES (22, 20, 4, '野生山菇', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 85.00, 1, 85.00, '乡村振兴示范县', '2025-09-08 14:30:02');
INSERT INTO `order_items` VALUES (23, 21, 5, '手工豆腐', '/api/file/download/a4cf6bd5-79e7-4e65-a14b-c029cbe10862.png', 12.00, 2, 24.00, '乡村振兴示范县', '2025-09-09 08:30:03');
INSERT INTO `order_items` VALUES (24, 22, 6, '手工糯米酒', '/api/file/download/848c3b19-966c-443c-ad68-5b6bbc21d3fd.png', 58.00, 1, 58.00, '乡村振兴示范县', '2025-09-10 17:30:04');
INSERT INTO `order_items` VALUES (25, 23, 3, '高山云雾茶', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 128.00, 1, 128.00, '乡村振兴示范县', '2025-09-11 09:30:05');
INSERT INTO `order_items` VALUES (26, 23, 5, '手工豆腐', '/api/file/download/a4cf6bd5-79e7-4e65-a14b-c029cbe10862.png', 12.00, 2, 24.00, '乡村振兴示范县', '2025-09-11 09:30:05');
INSERT INTO `order_items` VALUES (27, 23, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '乡村振兴示范县', '2025-09-11 09:30:05');
INSERT INTO `order_items` VALUES (28, 24, 4, '野生山菇', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 85.00, 1, 85.00, '乡村振兴示范县', '2025-09-12 11:30:06');
INSERT INTO `order_items` VALUES (29, 24, 5, '手工豆腐', '/api/file/download/a4cf6bd5-79e7-4e65-a14b-c029cbe10862.png', 12.00, 1, 12.00, '乡村振兴示范县', '2025-09-12 11:30:06');
INSERT INTO `order_items` VALUES (30, 25, 3, '高山云雾茶', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 128.00, 1, 128.00, '乡村振兴示范县', '2025-09-13 15:30:07');
INSERT INTO `order_items` VALUES (31, 25, 4, '野生山菇', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 85.00, 1, 85.00, '乡村振兴示范县', '2025-09-13 15:30:07');

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '订单号',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '订单总金额',
  `discount_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '优惠金额',
  `actual_amount` decimal(10, 2) NOT NULL COMMENT '实付金额',
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '支付方式',
  `payment_status` tinyint(1) NULL DEFAULT 0 COMMENT '支付状态：0待支付，1已支付，2支付失败',
  `order_status` tinyint(1) NULL DEFAULT 1 COMMENT '订单状态：1待支付，2待发货，3已发货，4已收货，5已取消，6已退款',
  `delivery_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '收货地址',
  `delivery_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收货人姓名',
  `delivery_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '收货人电话',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '订单备注',
  `payment_time` datetime(0) NULL DEFAULT NULL COMMENT '支付时间',
  `delivery_time` datetime(0) NULL DEFAULT NULL COMMENT '发货时间',
  `received_time` datetime(0) NULL DEFAULT NULL COMMENT '收货时间',
  `cancelled_time` datetime(0) NULL DEFAULT NULL COMMENT '取消时间',
  `cancel_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '取消原因',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_order_no`(`order_no`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_order_status`(`order_status`) USING BTREE,
  INDEX `idx_payment_status`(`payment_status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '订单表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (1, '2025091111083901', 2, 68.00, 0.00, 68.00, '支付宝', 0, 1, '乡村振兴示范县振兴路123号', '张三', '13800138001', '尽快发货', NULL, NULL, NULL, NULL, NULL, '2025-09-11 11:08:39', '2025-09-11 11:08:39', 0);
INSERT INTO `orders` VALUES (2, '2025091111083902', 2, 35.00, 0.00, 35.00, '微信支付', 1, 2, '乡村振兴示范县振兴路456号', '李四', '13800138002', '包装仔细点', '2025-09-11 11:10:00', NULL, NULL, NULL, NULL, '2025-09-11 11:08:40', '2025-09-11 11:10:00', 0);
INSERT INTO `orders` VALUES (3, '2025091111083903', 2, 103.00, 0.00, 103.00, '支付宝', 1, 3, '乡村振兴示范县振兴路789号', '王五', '13800138003', '', '2025-09-11 11:12:00', '2025-09-11 14:30:00', NULL, NULL, NULL, '2025-09-11 11:08:41', '2025-09-11 14:30:00', 0);
INSERT INTO `orders` VALUES (4, '2025091111083904', 2, 68.00, 0.00, 68.00, '微信支付', 1, 4, '乡村振兴示范县振兴路321号', '赵六', '13800138004', '已收货，很满意', '2025-09-11 11:15:00', '2025-09-11 15:00:00', '2025-09-11 18:00:00', NULL, NULL, '2025-09-11 11:08:42', '2025-09-11 18:00:00', 0);
INSERT INTO `orders` VALUES (5, '2025091111083905', 2, 35.00, 0.00, 35.00, '支付宝', 0, 5, '乡村振兴示范县振兴路654号', '孙七', '13800138005', '', NULL, NULL, NULL, '2025-09-11 11:20:00', '用户取消', '2025-09-11 11:08:43', '2025-09-11 11:20:00', 0);
INSERT INTO `orders` VALUES (6, '20250911112811776250', 8, 241.00, 0.00, 241.00, 'alipay', 1, 4, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', '2025-09-11 11:28:16', '2025-09-11 11:29:08', '2025-09-11 11:29:15', NULL, NULL, '2025-09-11 11:28:11', '2025-09-11 11:29:15', 0);
INSERT INTO `orders` VALUES (7, '20250911113006826669', 8, 68.00, 0.00, 68.00, 'alipay', 1, 3, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', '2025-09-11 11:30:09', '2025-09-11 11:30:33', NULL, NULL, NULL, '2025-09-11 11:30:07', '2025-09-11 11:30:33', 0);
INSERT INTO `orders` VALUES (8, '20250911124344195785', 8, 136.00, 0.00, 136.00, 'alipay', 1, 2, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '222', '2025-09-11 12:43:49', NULL, NULL, NULL, NULL, '2025-09-11 12:43:44', '2025-09-11 12:43:49', 0);
INSERT INTO `orders` VALUES (9, '20250911124540743561', 8, 136.00, 0.00, 136.00, 'alipay', 1, 2, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', '2025-09-11 12:45:45', NULL, NULL, NULL, NULL, '2025-09-11 12:45:41', '2025-09-11 12:45:45', 0);
INSERT INTO `orders` VALUES (10, '20250911124859732217', 8, 35.00, 0.00, 35.00, 'alipay', 0, 5, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', NULL, NULL, NULL, '2025-09-11 12:49:22', '用户取消', '2025-09-11 12:49:00', '2025-09-11 12:49:22', 0);
INSERT INTO `orders` VALUES (11, '20250911125022187625', 8, 136.00, 0.00, 136.00, 'alipay', 1, 2, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', '2025-09-11 12:50:25', NULL, NULL, NULL, NULL, '2025-09-11 12:50:22', '2025-09-11 12:50:25', 0);
INSERT INTO `orders` VALUES (12, '20250911125215763263', 8, 204.00, 0.00, 204.00, 'alipay', 0, 5, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', NULL, NULL, NULL, '2025-09-11 13:40:06', '444', '2025-09-11 12:52:15', '2025-09-11 13:40:06', 0);
INSERT INTO `orders` VALUES (13, '20250911130238847605', 8, 70.00, 0.00, 70.00, 'wechat', 1, 2, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', '2025-09-11 13:02:41', NULL, NULL, NULL, NULL, '2025-09-11 13:02:39', '2025-09-11 13:02:41', 0);
INSERT INTO `orders` VALUES (14, '20250911135338748950', 8, 35.00, 0.00, 35.00, 'alipay', 0, 5, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', NULL, NULL, NULL, '2025-09-11 14:26:56', '不卖了！！', '2025-09-11 13:53:38', '2025-09-11 14:26:56', 0);
INSERT INTO `orders` VALUES (15, '20250911164455562310', 9, 35.00, 0.00, 35.00, 'alipay', 1, 2, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-11 16:44:56', NULL, NULL, NULL, NULL, '2025-09-11 16:44:55', '2025-09-11 16:44:56', 0);
INSERT INTO `orders` VALUES (16, '20250911173631254356', 9, 70.00, 0.00, 70.00, 'alipay', 1, 2, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-11 17:36:33', NULL, NULL, NULL, NULL, '2025-09-11 17:36:31', '2025-09-11 17:36:33', 0);
INSERT INTO `orders` VALUES (17, '20250911173909190165', 9, 68.00, 0.00, 68.00, 'alipay', 1, 4, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-11 17:39:11', '2025-09-11 17:39:22', '2025-09-11 17:39:28', NULL, NULL, '2025-09-11 17:39:09', '2025-09-11 17:39:28', 0);
INSERT INTO `orders` VALUES (18, '20250911174418364101', 9, 35.00, 0.00, 35.00, 'alipay', 1, 2, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-11 17:44:21', NULL, NULL, NULL, NULL, '2025-09-11 17:44:18', '2025-09-11 17:44:21', 0);
INSERT INTO `orders` VALUES (19, '20250907103001001', 8, 128.00, 0.00, 128.00, 'alipay', 1, 4, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '包装要仔细', '2025-09-07 10:30:05', '2025-09-07 11:00:00', '2025-09-07 18:30:00', NULL, NULL, '2025-09-07 10:30:01', '2025-09-07 18:30:00', 0);
INSERT INTO `orders` VALUES (20, '20250908143002002', 9, 85.00, 0.00, 85.00, 'wechat', 1, 3, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-08 14:30:08', '2025-09-08 15:00:00', NULL, NULL, NULL, '2025-09-08 14:30:02', '2025-09-08 15:00:00', 0);
INSERT INTO `orders` VALUES (21, '20250909083003003', 8, 24.00, 0.00, 24.00, 'alipay', 1, 4, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', '2025-09-09 08:30:10', '2025-09-09 09:00:00', '2025-09-09 16:20:00', NULL, NULL, '2025-09-09 08:30:03', '2025-09-09 16:20:00', 0);
INSERT INTO `orders` VALUES (22, '20250910173004004', 9, 58.00, 0.00, 58.00, 'alipay', 1, 2, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-10 17:30:12', NULL, NULL, NULL, NULL, '2025-09-10 17:30:04', '2025-09-10 17:30:12', 0);
INSERT INTO `orders` VALUES (23, '20250911093005005', 8, 170.00, 0.00, 170.00, 'wechat', 1, 4, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '多买点', '2025-09-11 09:30:15', '2025-09-11 10:00:00', '2025-09-11 17:45:00', NULL, NULL, '2025-09-11 09:30:05', '2025-09-11 17:45:00', 0);
INSERT INTO `orders` VALUES (24, '20250912113006006', 9, 96.00, 0.00, 96.00, 'alipay', 1, 3, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-12 11:30:18', '2025-09-12 12:00:00', NULL, NULL, NULL, '2025-09-12 11:30:06', '2025-09-12 12:00:00', 0);
INSERT INTO `orders` VALUES (25, '20250913153007007', 8, 213.00, 0.00, 213.00, 'alipay', 1, 4, '湖南省 长沙市 岳麓区 乡村路123号', '李四', '13800138000', '', '2025-09-13 15:30:20', '2025-09-13 16:00:00', '2025-09-13 19:15:00', NULL, NULL, '2025-09-13 15:30:07', '2025-09-13 19:15:00', 0);

-- ============================================================
-- 商品模块
-- ============================================================

-- ----------------------------
-- Table structure for product_categories
-- ----------------------------
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '分类名称',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分类描述',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分类图标',
  `sort_order` int(0) NULL DEFAULT 0 COMMENT '排序值',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品分类表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product_categories
-- ----------------------------
INSERT INTO `product_categories` VALUES (1, '农特产品', '新鲜优质的农产品', '/api/file/download/a4cf6bd5-79e7-4e65-a14b-c029cbe10862.png', 1, 1, '2025-09-09 10:19:20', '2025-09-11 16:27:12');
INSERT INTO `product_categories` VALUES (2, '手工艺品', '传统手工制作的艺术品', '/icons/handicraft.png', 2, 1, '2025-09-09 10:19:20', '2025-09-09 10:19:20');
INSERT INTO `product_categories` VALUES (3, '土特产', '当地特色产品', '/icons/specialty.png', 3, 1, '2025-09-09 10:19:20', '2025-09-09 10:19:20');
INSERT INTO `product_categories` VALUES (4, '纪念品', '旅游纪念品', '/icons/souvenir.png', 4, 1, '2025-09-09 10:19:20', '2025-09-09 10:19:20');

-- ----------------------------
-- Table structure for product_reviews
-- ----------------------------
DROP TABLE IF EXISTS `product_reviews`;
CREATE TABLE `product_reviews`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `product_id` bigint(0) NOT NULL COMMENT '商品ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `order_id` bigint(0) NULL DEFAULT NULL COMMENT '订单ID',
  `rating` tinyint(1) NOT NULL COMMENT '评分：1-5星',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '评价内容',
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '评价图片（JSON数组）',
  `is_anonymous` tinyint(1) NULL DEFAULT 0 COMMENT '是否匿名评价：0否，1是',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：0待审核，1已通过，2已拒绝',
  `reply_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '商家回复内容',
  `reply_time` datetime(0) NULL DEFAULT NULL COMMENT '商家回复时间',
  `helpful_count` int(0) NULL DEFAULT 0 COMMENT '有用数',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_product_id`(`product_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_order_id`(`order_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品评价表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product_reviews
-- ----------------------------
INSERT INTO `product_reviews` VALUES (1, 1, 8, 6, 5, '蜂蜜质量非常好，纯天然的味道，包装也很精美，值得推荐！', '[\"/api/file/download/review1.jpg\"]', 0, 1, '感谢您的好评，我们会继续保持品质！', '2025-09-11 12:00:00', 3, '2025-09-11 11:30:00', '2025-09-11 17:38:58', 0);
INSERT INTO `product_reviews` VALUES (2, 1, 9, 15, 4, '蜂蜜很甜，但是感觉有点贵，不过质量确实不错。', NULL, 0, 1, NULL, NULL, 1, '2025-09-11 17:00:00', '2025-09-11 17:00:00', 0);
INSERT INTO `product_reviews` VALUES (3, 2, 8, 13, 5, '竹编篮做工精细，很实用，放在家里很好看，手工艺品就是不一样！', '[\"/api/file/download/review3.jpg\", \"/api/file/download/review4.jpg\"]', 0, 1, '谢谢支持，我们的手工艺品都是传统工艺制作。', '2025-09-11 14:00:00', 1, '2025-09-11 13:30:00', '2025-09-11 17:53:44', 0);
INSERT INTO `product_reviews` VALUES (4, 2, 9, NULL, 3, '好吃好吃好吃好吃好吃好吃好吃好吃', '[\"/api/file/review-1757584416398-0.jpg\"]', 0, 1, NULL, NULL, 1, '2025-09-11 17:53:36', '2025-09-11 17:58:49', 0);
INSERT INTO `product_reviews` VALUES (5, 2, 9, NULL, 5, '11111111111111', '[\"/api/file/download/4ea325ec-6b41-444a-90b9-79274bcec174.jpg\"]', 0, 1, NULL, NULL, 1, '2025-09-11 18:04:35', '2025-09-11 18:04:41', 0);
INSERT INTO `product_reviews` VALUES (6, 1, 8, NULL, 5, '好吃还吃爱吃', '[\"/api/file/download/053d607f-fc14-48b1-9475-6796cce8905f.png\"]', 0, 1, NULL, NULL, 0, '2025-09-11 19:14:58', '2025-09-11 19:14:58', 0);

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品名称',
  `category_id` bigint(0) NOT NULL COMMENT '分类ID',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '商品描述',
  `cover_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '封面图片',
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '图片集合（JSON数组）',
  `price` decimal(10, 2) NOT NULL COMMENT '价格',
  `original_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '原价',
  `stock` int(0) NULL DEFAULT 0 COMMENT '库存数量',
  `sales_count` int(0) NULL DEFAULT 0 COMMENT '销量',
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '单位',
  `weight` decimal(8, 2) NULL DEFAULT NULL COMMENT '重量（kg）',
  `specifications` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '规格参数（JSON）',
  `origin` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '产地',
  `rating` decimal(3, 2) NULL DEFAULT 0.00 COMMENT '评分',
  `review_count` int(0) NULL DEFAULT 0 COMMENT '评价总数',
  `avg_rating` decimal(3, 2) NULL DEFAULT 0.00 COMMENT '平均评分',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：0下架，1上架',
  `is_featured` tinyint(1) NULL DEFAULT 0 COMMENT '是否推荐：0否，1是',
  `sort_order` int(0) NULL DEFAULT 0 COMMENT '排序值',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category_id`(`category_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_featured`(`is_featured`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, '胡萝卜', 1, '新鲜采摘的优质胡萝卜，色泽鲜亮，口感脆甜，富含胡萝卜素和多种维生素', '/api/file/download/农产品_胡萝卜.jpg', '[]', 8.00, 12.00, 300, 120, '斤', 0.50, '{\"产地\":\"乡村振兴示范县\",\"采摘季节\":\"全年\"}', '乡村振兴示范县', 4.60, 2, 4.50, 1, 1, 1, '2025-09-09 10:19:20', '2025-09-15 20:26:56', 0);
INSERT INTO `products` VALUES (2, '香包', 2, '手工缝制传统香包，填充天然香料，造型精美，寓意吉祥', '/api/file/download/工艺品_香包.jpg', '[]', 35.00, 45.00, 191, 76, '个', 0.10, '{\"材质\":\"丝绸布料\",\"工艺\":\"手工缝制\"}', '乡村振兴示范县', 4.60, 1, 5.00, 1, 1, 2, '2025-09-09 10:19:20', '2025-09-15 20:28:16', 0);
INSERT INTO `products` VALUES (3, '西红柿', 1, '自然成熟的西红柿，果肉饱满，酸甜多汁，适合生食或烹饪', '/api/file/download/农产品_西红柿.jpg', '[]', 6.00, 9.00, 400, 156, '斤', 0.50, '{\"产地\":\"乡村振兴示范县\",\"采摘季节\":\"夏秋\"}', '乡村振兴示范县', 4.70, 8, 4.60, 1, 1, 6, '2025-09-07 11:30:00', '2025-09-07 11:30:00', 0);
INSERT INTO `products` VALUES (4, '黄豆', 1, '优质非转基因黄豆，颗粒饱满，蛋白质含量高，适合磨豆浆、做豆腐', '/api/file/download/农产品_黄豆.jpg', '[]', 12.00, 16.00, 500, 98, '斤', 0.50, '{\"产地\":\"乡村振兴示范县\",\"品种\":\"非转基因\"}', '乡村振兴示范县', 4.40, 5, 4.40, 1, 1, 7, '2025-09-09 16:45:00', '2025-09-15 20:30:37', 0);
INSERT INTO `products` VALUES (5, '玉米', 1, '新鲜甜玉米，粒粒饱满，清甜软糯，可直接蒸煮食用', '/api/file/download/农产品_玉米.jpg', '[]', 5.00, 8.00, 600, 210, '斤', 0.40, '{\"产地\":\"乡村振兴示范县\",\"品种\":\"甜玉米\"}', '乡村振兴示范县', 4.50, 15, 4.50, 1, 1, 8, '2025-09-11 08:20:00', '2025-09-15 20:32:44', 0);
INSERT INTO `products` VALUES (6, '奉节脐橙', 3, '奉节特产脐橙，皮薄多汁，酸甜适口，富含维C', '/api/file/download/土特产_奉节脐橙.jpg', '[]', 58.00, 78.00, 300, 67, '箱', 2.50, '{\"规格\":\"5kg/箱\",\"产地\":\"重庆奉节\"}', '奉节县', 4.80, 12, 4.80, 1, 1, 9, '2025-09-12 13:10:00', '2025-09-15 20:33:20', 0);
INSERT INTO `products` VALUES (7, '铜制茶器', 2, '手工锻造铜制茶器套装，做工精细，古色古香，品茗佳选', '/api/file/download/工艺品_铜制茶器.jpg', '[]', 168.00, 218.00, 80, 32, '套', 1.20, '{\"材质\":\"纯铜\",\"工艺\":\"手工锻造\"}', '乡村振兴示范县', 4.70, 3, 4.60, 1, 1, 10, '2025-09-13 09:00:00', '2025-09-13 09:00:00', 0);
INSERT INTO `products` VALUES (8, '熊猫书签', 4, '可爱熊猫造型书签，精工制作，阅读好伴侣，旅行纪念佳品', '/api/file/download/纪念品_熊猫书签.jpg', '[]', 15.00, 25.00, 500, 189, '个', 0.05, '{\"材质\":\"合金电镀\",\"尺寸\":\"8x3cm\"}', '乡村振兴示范县', 4.90, 6, 4.90, 1, 1, 11, '2025-09-13 09:00:00', '2025-09-13 09:00:00', 0);

-- ----------------------------
-- Table structure for review_helpful
-- ----------------------------
DROP TABLE IF EXISTS `review_helpful`;
CREATE TABLE `review_helpful`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `review_id` bigint(0) NOT NULL COMMENT '评价ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_review_user`(`review_id`, `user_id`) USING BTREE,
  INDEX `idx_review_id`(`review_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '评价有用表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of review_helpful
-- ----------------------------
INSERT INTO `review_helpful` VALUES (2, 1, 1, '2025-09-11 13:00:00');
INSERT INTO `review_helpful` VALUES (3, 1, 2, '2025-09-11 13:30:00');
INSERT INTO `review_helpful` VALUES (4, 2, 8, '2025-09-11 17:30:00');
INSERT INTO `review_helpful` VALUES (6, 3, 1, '2025-09-11 15:00:00');
INSERT INTO `review_helpful` VALUES (7, 1, 9, '2025-09-11 17:38:59');
INSERT INTO `review_helpful` VALUES (9, 4, 9, '2025-09-11 17:58:50');
INSERT INTO `review_helpful` VALUES (10, 5, 9, '2025-09-11 18:04:42');

-- ----------------------------
-- Table structure for shopping_cart
-- ----------------------------
DROP TABLE IF EXISTS `shopping_cart`;
CREATE TABLE `shopping_cart`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `product_id` bigint(0) NOT NULL COMMENT '商品ID',
  `quantity` int(0) NOT NULL DEFAULT 1 COMMENT '数量',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '添加时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_product`(`user_id`, `product_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '购物车表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of shopping_cart
-- ----------------------------

-- ============================================================
-- 系统模块
-- ============================================================

-- ----------------------------
-- Table structure for system_config
-- ----------------------------
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '配置键名',
  `config_value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '配置键值',
  `config_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '配置名称',
  `config_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'text' COMMENT '配置类型(text/number/boolean/select/date)',
  `config_options` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '配置可选项，用于select类型',
  `group_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '默认' COMMENT '分组名称',
  `sort` int(0) NULL DEFAULT 0 COMMENT '排序',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_config_key`(`config_key`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统配置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of system_config
-- ----------------------------
INSERT INTO `system_config` VALUES (1, 'system_name', '乡村振兴·智兴乡村平台', '系统名称', 'text', NULL, '基本设置', 1, '系统显示名称', '2025-09-08 16:55:07', '2025-09-08 17:47:53');
INSERT INTO `system_config` VALUES (2, 'system_version', '1.0.0', '系统版本', 'text', NULL, '基本设置', 2, '系统版本号', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (3, 'system_logo', '/logo.png', '系统Logo', 'text', NULL, '基本设置', 3, '系统Logo路径', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (4, 'order_expire_minutes', '15', '订单过期时间(分钟)', 'number', NULL, '订单设置', 1, '未支付订单自动取消的时间(分钟)', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (5, 'allow_refund_before_minutes', '30', '允许退票时间(分钟)', 'number', NULL, '订单设置', 2, '电影开场前多少分钟允许退票', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (6, 'refund_fee_rate', '10', '退票手续费率(%)', 'number', NULL, '订单设置', 3, '退票收取的手续费比例', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (7, 'email_enabled', 'false', '启用邮件通知', 'boolean', NULL, '通知设置', 1, '是否启用邮件通知功能', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (8, 'email_host', 'smtp.example.com', '邮件服务器地址', 'text', NULL, '通知设置', 2, 'SMTP服务器地址', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (9, 'email_port', '25', '邮件服务器端口', 'number', NULL, '通知设置', 3, 'SMTP服务器端口', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (10, 'email_username', 'noreply@example.com', '邮件账号', 'text', NULL, '通知设置', 4, '发件人邮箱地址', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (11, 'email_password', 'password', '邮件密码', 'text', NULL, '通知设置', 5, '发件人邮箱密码', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (12, 'payment_methods', 'ALIPAY,WECHAT,UNIONPAY,CREDIT_CARD', '支持的支付方式', 'select', 'ALIPAY:支付宝,WECHAT:微信支付,UNIONPAY:银联支付,CREDIT_CARD:信用卡,CASH:现金支付', '支付设置', 1, '系统支持的支付方式，多个用逗号分隔', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (13, 'default_payment', 'ALIPAY', '默认支付方式', 'select', 'ALIPAY:支付宝,WECHAT:微信支付,UNIONPAY:银联支付,CREDIT_CARD:信用卡,CASH:现金支付', '支付设置', 2, '默认选中的支付方式', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (14, 'max_tickets_per_order', '4', '单次最大购票数', 'number', NULL, '订单设置', 4, '单个订单最多可购买的电影票数量', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (15, 'registration_enabled', 'true', '允许注册', 'boolean', NULL, '用户设置', 1, '是否允许用户注册', '2025-09-08 16:55:07', '2025-09-08 16:55:07');
INSERT INTO `system_config` VALUES (16, 'verify_email', 'false', '邮箱验证', 'boolean', NULL, '用户设置', 2, '注册时是否需要验证邮箱', '2025-09-08 16:55:07', '2025-09-08 16:55:07');

-- ----------------------------
-- Table structure for system_logs
-- ----------------------------
DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE `system_logs`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` bigint(0) NULL DEFAULT NULL COMMENT '操作用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作用户名',
  `module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作模块',
  `operation` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作类型',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作描述',
  `request_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '请求方法',
  `request_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '请求URL',
  `request_params` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '请求参数',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作IP地址',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '操作状态：0失败，1成功',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '错误信息',
  `execution_time` bigint(0) NULL DEFAULT NULL COMMENT '执行时长(ms)',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE,
  INDEX `idx_module`(`module`) USING BTREE,
  INDEX `idx_operation`(`operation`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 195 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统操作日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of system_logs
-- ----------------------------
INSERT INTO `system_logs` VALUES (260, NULL, 'admin', '订单管理', '获取订单统计', '获取订单统计数据', 'GET', '/orders/stats', '{}', '0:0:0:0:0:0:0:1', 1, NULL, 12, '2025-09-15 21:05:24');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '电子邮箱',
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '手机号码',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '真实姓名',
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'USER' COMMENT '角色：ADMIN, USER',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户头像URL',
  `enabled` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用',
  `locked` tinyint(1) NULL DEFAULT 0 COMMENT '是否锁定',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  UNIQUE INDEX `email`(`email`) USING BTREE,
  INDEX `idx_username`(`username`) USING BTREE,
  INDEX `idx_email`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '123456', '2232574827@qq.com', '18362483634', 'admin', 'ADMIN', '/api/file/download/ef8b5054-32aa-4991-842d-729ffe771e11.jpg', 1, 0, '2025-09-08 17:26:32', '2025-09-09 11:41:27', 0);
INSERT INTO `users` VALUES (8, 'lisi', '123456', '22323573@qq.com', '18276999999', '李四', 'USER', '/api/file/download/76ca4190-2d17-4173-8683-8d2617216900.jpg', 1, 0, '2025-09-08 17:27:18', '2025-09-11 15:15:57', 0);
INSERT INTO `users` VALUES (9, 'zhangsan', '123456', '2232456789@qq.com', '18245678956', '张三', 'USER', '/api/file/download/893fa06d-33ae-4b04-b4f7-e2e230d16668.jpg', 1, 0, '2025-09-09 13:29:17', '2025-09-09 13:29:17', 0);

-- ============================================================
-- 溯源模块
-- ============================================================

-- ----------------------------
-- Table structure for product_batches
-- ----------------------------
DROP TABLE IF EXISTS `product_batches`;
CREATE TABLE `product_batches`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '批次ID',
  `product_id` bigint(0) NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品名称',
  `batch_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '批次号',
  `production_date` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '生产日期',
  `shelf_life` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '保质期',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：0禁用，1正常',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_batch_no`(`batch_no`) USING BTREE,
  INDEX `idx_product_id`(`product_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '产品批次表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product_batches
-- ----------------------------
INSERT INTO `product_batches` VALUES (1, 1, '胡萝卜', 'TY-HLB-20260301', '2026-03-01', '15天', 1, '2026-03-01 00:00:00', '2026-03-01 00:00:00');
INSERT INTO `product_batches` VALUES (2, 2, '香包', 'TY-XB-20260315', '2026-03-15', '24个月', 1, '2026-03-15 00:00:00', '2026-03-15 00:00:00');
INSERT INTO `product_batches` VALUES (3, 3, '西红柿', 'TY-XHSH-20260401', '2026-04-01', '10天', 1, '2026-04-01 00:00:00', '2026-04-01 00:00:00');
INSERT INTO `product_batches` VALUES (4, 4, '黄豆', 'TY-HD-20260410', '2026-04-10', '12个月', 1, '2026-04-10 00:00:00', '2026-04-10 00:00:00');
INSERT INTO `product_batches` VALUES (5, 5, '玉米', 'TY-YM-20260405', '2026-04-05', '7天', 1, '2026-04-05 00:00:00', '2026-04-05 00:00:00');
INSERT INTO `product_batches` VALUES (6, 6, '奉节脐橙', 'FJ-QC-20260320', '2026-03-20', '30天', 1, '2026-03-20 00:00:00', '2026-03-20 00:00:00');
INSERT INTO `product_batches` VALUES (7, 7, '铜制茶器', 'TY-TCQ-20260325', '2026-03-25', '长期', 1, '2026-03-25 00:00:00', '2026-03-25 00:00:00');
INSERT INTO `product_batches` VALUES (8, 8, '熊猫书签', 'TY-XMSJ-20260401', '2026-04-01', '长期', 1, '2026-04-01 00:00:00', '2026-04-01 00:00:00');

-- ----------------------------
-- Table structure for trace_records
-- ----------------------------
DROP TABLE IF EXISTS `trace_records`;
CREATE TABLE `trace_records`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '溯源记录ID',
  `product_id` bigint(0) NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品名称',
  `batch_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '批次号',
  `stage` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '环节标识',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '环节标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '环节描述',
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '图片（JSON数组）',
  `location` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '地点',
  `operator` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作人',
  `operator_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作人类型',
  `operation_date` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作日期',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '备注（JSON数组）',
  `is_quality_check` tinyint(1) NULL DEFAULT 0 COMMENT '是否质检环节',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_product_id`(`product_id`) USING BTREE,
  INDEX `idx_batch_no`(`batch_no`) USING BTREE,
  INDEX `idx_stage`(`stage`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 57 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '溯源记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of trace_records
-- ----------------------------
-- 商品1：胡萝卜
INSERT INTO `trace_records` VALUES (1, 1, '胡萝卜', 'TY-HLB-20260301', 'planting', '胡萝卜播种管理', '在示范县绿野镇蔬菜基地选用优质"红映二号"胡萝卜品种，采用有机种植方式，施用腐熟农家有机肥作底肥，土壤深翻30cm确保疏松透气。', '["https://picsum.photos/seed/carrot-plant/400/300"]', '示范县绿野镇蔬菜基地', '绿源蔬菜合作社', '合作社', '2025-10-15', '["有机种植认证编号：YN-2025-1023","品种：红映二号","种植面积：80亩"]', 0, '2025-10-15 00:00:00', '2025-10-15 00:00:00', 0);
INSERT INTO `trace_records` VALUES (2, 1, '胡萝卜', 'TY-HLB-20260301', 'growing', '田间生长管理', '采用滴灌技术精准灌溉，安装太阳能杀虫灯进行物理防虫，越冬期间覆膜保温。生长周期约120天。', '["https://picsum.photos/seed/carrot-grow/400/300"]', '示范县绿野镇蔬菜基地', '技术员赵师傅', '技术员', '2025-12-20', '["灌溉方式：滴灌","生长周期：约120天","防虫方式：太阳能杀虫灯"]', 0, '2025-12-20 00:00:00', '2025-12-20 00:00:00', 0);
INSERT INTO `trace_records` VALUES (3, 1, '胡萝卜', 'TY-HLB-20260301', 'harvesting', '人工采挖收获', '选择晴好天气进行人工采挖，轻拔避免断根损伤。现场去除泥土并初步分选，剔除畸形根和破损根。', '["https://picsum.photos/seed/carrot-harvest/400/300"]', '示范县绿野镇蔬菜基地', '采挖组刘队长', '农户', '2026-02-25', '["亩产约3000斤","一级品占比：85%","外观标准：色泽鲜亮、根形直"]', 0, '2026-02-25 00:00:00', '2026-02-25 00:00:00', 0);
INSERT INTO `trace_records` VALUES (4, 1, '胡萝卜', 'TY-HLB-20260301', 'processing', '清洗分级整理', '采用高压水流清洗去除泥沙，按直径和长度分为三级（直径3-5cm为一级品）。', '[]', '示范县农产品加工中心', '示范县农创科技有限公司', '企业', '2026-02-27', '["分级标准：直径3-5cm为一级品","清洗方式：高压水流"]', 0, '2026-02-27 00:00:00', '2026-02-27 00:00:00', 0);
INSERT INTO `trace_records` VALUES (5, 1, '胡萝卜', 'TY-HLB-20260301', 'quality', '品质安全检测', '经湖南省农产品质量检测中心检测，胡萝卜素含量、农药残留、重金属等各项指标均符合 GB 2762-2022 标准。', '["https://picsum.photos/seed/carrot-quality/400/300"]', '湖南省农产品质量检测中心', '检验员王工', '检测机构', '2026-02-28', '["检测报告编号：HN-2026-SC-0528","胡萝卜素含量：8.2mg/100g","农残检测：未检出","检测结果：全部合格"]', 1, '2026-02-28 00:00:00', '2026-02-28 00:00:00', 0);
INSERT INTO `trace_records` VALUES (6, 1, '胡萝卜', 'TY-HLB-20260301', 'packaging', '分装贴标入库', '采用食品级网袋分装，每袋2斤。外贴溯源标签和营养成分表。包装后送入冷库预冷至2-5℃。', '[]', '示范县农产品加工中心', '示范县农创科技有限公司', '企业', '2026-02-28', '["包装规格：2斤/袋","预冷温度：2-5℃","存储条件：阴凉干燥处"]', 0, '2026-02-28 00:00:00', '2026-02-28 00:00:00', 0);
INSERT INTO `trace_records` VALUES (7, 1, '胡萝卜', 'TY-HLB-20260301', 'logistics', '冷链物流配送', '已由京东冷链发出，全程2-8℃冷链运输，预计1-2个工作日送达。', '[]', '示范县物流中心', '京东冷链', '物流企业', '2026-03-01', '["快递单号：JD20260301HLB001","运输方式：冷链","运输温度：2-8℃","预计送达：1-2天"]', 0, '2026-03-01 00:00:00', '2026-03-01 00:00:00', 0);
-- 商品2：香包
INSERT INTO `trace_records` VALUES (8, 2, '香包', 'TY-XB-20260315', 'planting', '丝绸布料与香料备选', '甄选上等湖州丝绸布料，采购艾草、薰衣草、丁香等天然植物香料。所有原料经过严格质检入库。', '["https://picsum.photos/seed/sachet-material/400/300"]', '示范县非遗工坊', '非遗工坊采购部', '企业', '2026-02-01', '["布料：湖州丝绸","香料：艾草、薰衣草、丁香","原料质检：全部合格"]', 0, '2026-02-01 00:00:00', '2026-02-01 00:00:00', 0);
INSERT INTO `trace_records` VALUES (9, 2, '香包', 'TY-XB-20260315', 'growing', '传统纹样设计制版', '由非遗传承人设计传统吉祥纹样，包括"莲年有余""福寿双全""喜上眉梢"等经典图案。', '["https://picsum.photos/seed/sachet-design/400/300"]', '示范县非遗工坊设计室', '设计师陈老师', '技师', '2026-02-15', '["纹样系列：莲年有余、福寿双全、喜上眉梢","设计风格：传统吉祥纹样"]', 0, '2026-02-15 00:00:00', '2026-02-15 00:00:00', 0);
INSERT INTO `trace_records` VALUES (10, 2, '香包', 'TY-XB-20260315', 'harvesting', '手工刺绣缝制', '经验丰富的绣娘按照底稿进行手工刺绣，采用平针绣、回针绣等传统针法。每个香包制作周期约4小时。', '["https://picsum.photos/seed/sachet-embroider/400/300"]', '示范县非遗工坊', '绣娘张阿姨', '手艺人', '2026-03-01', '["每个制作周期：约4小时","绣娘从业年限：15年以上","针法：平针绣、回针绣"]', 0, '2026-03-01 00:00:00', '2026-03-01 00:00:00', 0);
INSERT INTO `trace_records` VALUES (11, 2, '香包', 'TY-XB-20260315', 'processing', '精细修整装饰', '剪除多余线头，熨烫定型使布面平整。安装流苏和挂绳，逐个检查刺绣质量。', '[]', '示范县非遗工坊', '非遗工坊品控组', '企业', '2026-03-05', '["工序：修整→熨烫→装流苏→终检","质量标准：无线头外露"]', 0, '2026-03-05 00:00:00', '2026-03-05 00:00:00', 0);
INSERT INTO `trace_records` VALUES (12, 2, '香包', 'TY-XB-20260315', 'quality', '成品质量检验', '逐件检验刺绣密度、缝制牢固度、香料填充量和布料质量。本批次抽检合格率100%。', '["https://picsum.photos/seed/sachet-quality/400/300"]', '示范县非遗工坊', '品控主管李女士', '检测机构', '2026-03-08', '["抽检数量：50件","合格率：100%","等级：优等品","检验项目：刺绣密度、缝制牢固度、香料填充量"]', 1, '2026-03-08 00:00:00', '2026-03-08 00:00:00', 0);
INSERT INTO `trace_records` VALUES (13, 2, '香包', 'TY-XB-20260315', 'packaging', '礼盒包装入库', '每件香包独立无纺布袋封装防尘，装入田园主题文创礼盒。内附文化卡片。', '[]', '示范县非遗工坊', '非遗工坊包装组', '企业', '2026-03-10', '["包装：田园主题文创礼盒","内附：文化卡片"]', 0, '2026-03-10 00:00:00', '2026-03-10 00:00:00', 0);
INSERT INTO `trace_records` VALUES (14, 2, '香包', 'TY-XB-20260315', 'logistics', '快递发出', '已由顺丰快递发出，采用防震气泡膜多层包裹保护。预计2-3个工作日送达。', '[]', '示范县物流中心', '顺丰快递', '物流企业', '2026-03-15', '["快递单号：SF20260315XB001","包装：防震气泡膜","预计送达：2-3天"]', 0, '2026-03-15 00:00:00', '2026-03-15 00:00:00', 0);
-- 商品3：西红柿
INSERT INTO `trace_records` VALUES (15, 3, '西红柿', 'TY-XHSH-20260401', 'planting', '西红柿育苗定植', '在杨溪桥镇蔬菜大棚进行温室育苗，选用"粉贝拉"粉果番茄品种，采用有机基质栽培，定植密度每亩约2200株。', '["https://picsum.photos/seed/tomato-plant/400/300"]', '示范县桥溪镇蔬菜大棚', '绿丰蔬菜种植合作社', '合作社', '2025-11-01', '["品种：粉贝拉","定植密度：每亩2200株","栽培方式：有机基质栽培"]', 0, '2025-11-01 00:00:00', '2025-11-01 00:00:00', 0);
INSERT INTO `trace_records` VALUES (16, 3, '西红柿', 'TY-XHSH-20260401', 'growing', '温室培育管理', '智能温室精准控制温湿度，昼温25℃夜温15℃。采用熊蜂授粉替代人工点花，定期整枝打杈。', '["https://picsum.photos/seed/tomato-grow/400/300"]', '示范县桥溪镇蔬菜大棚', '技术员小刘', '技术员', '2026-01-15', '["授粉方式：熊蜂授粉","灌溉方式：滴灌","温控：昼25℃夜15℃"]', 0, '2026-01-15 00:00:00', '2026-01-15 00:00:00', 0);
INSERT INTO `trace_records` VALUES (17, 3, '西红柿', 'TY-XHSH-20260401', 'harvesting', '自然成熟采摘', '待果实充分转色（八成熟以上）后采摘，保留果蒂和萼片保持新鲜度。选择晨间采摘避开高温时段。', '["https://picsum.photos/seed/tomato-harvest/400/300"]', '示范县桥溪镇蔬菜大棚', '采摘组王大姐', '农户', '2026-03-28', '["采摘标准：八成熟以上转色果","亩产：约5000斤","采摘时间：清晨"]', 0, '2026-03-28 00:00:00', '2026-03-28 00:00:00', 0);
INSERT INTO `trace_records` VALUES (18, 3, '西红柿', 'TY-XHSH-20260401', 'processing', '分选包装处理', '按果实大小和颜色进行分级，单果150g以上为一级品。剔除病果和裂果。', '[]', '示范县农产品分拣中心', '示范县农创科技有限公司', '企业', '2026-03-29', '["分级标准：单果150g以上为一级品","处理时效：采摘后2小时内"]', 0, '2026-03-29 00:00:00', '2026-03-29 00:00:00', 0);
INSERT INTO `trace_records` VALUES (19, 3, '西红柿', 'TY-XHSH-20260401', 'quality', '品质安全检测', '检测农残、重金属、维生素C含量等指标，各项指标均符合 GB 2763-2021 标准。', '["https://picsum.photos/seed/tomato-quality/400/300"]', '湖南省农产品质量检测中心', '检验员周工', '检测机构', '2026-03-30', '["检测报告编号：HN-2026-XHSH-0330","维C含量：19.8mg/100g","农残检测：未检出","检测结果：全部合格"]', 1, '2026-03-30 00:00:00', '2026-03-30 00:00:00', 0);
INSERT INTO `trace_records` VALUES (20, 3, '西红柿', 'TY-XHSH-20260401', 'packaging', '分装贴标入库', '采用透气食品级纸箱分装，每箱5斤。单果泡沫网套保护。外贴溯源标签和食用建议卡。', '[]', '示范县农产品分拣中心', '示范县农创科技有限公司', '企业', '2026-03-31', '["包装规格：5斤/箱","保护方式：泡沫网套","纸箱类型：透气食品级"]', 0, '2026-03-31 00:00:00', '2026-03-31 00:00:00', 0);
INSERT INTO `trace_records` VALUES (21, 3, '西红柿', 'TY-XHSH-20260401', 'logistics', '冷链物流配送', '已由京东冷链发出，全程8-12℃冷藏运输。预计1-2个工作日送达。', '[]', '示范县物流中心', '京东冷链', '物流企业', '2026-04-01', '["快递单号：JD20260401XHSH01","运输方式：冷链","运输温度：8-12℃","预计送达：1-2天"]', 0, '2026-04-01 00:00:00', '2026-04-01 00:00:00', 0);
-- 商品4：黄豆
INSERT INTO `trace_records` VALUES (22, 4, '黄豆', 'TY-HD-20260410', 'planting', '黄豆播种管理', '在示范县太平乡选用"中黄41号"非转基因黄豆品种，轮作地块条播种植。施用腐熟农家肥作底肥。', '["https://picsum.photos/seed/soybean-plant/400/300"]', '示范县太平乡', '丰源粮油合作社', '合作社', '2025-06-10', '["品种：中黄41号（非转基因）","种植面积：150亩","种植方式：轮作条播"]', 0, '2025-06-10 00:00:00', '2025-06-10 00:00:00', 0);
INSERT INTO `trace_records` VALUES (23, 4, '黄豆', 'TY-HD-20260410', 'growing', '田间生长管理', '出苗后及时间苗定苗，中耕除草培土促进根系发育，花期追施磷钾肥。安装频振式诱虫灯防治豆荚螟。', '["https://picsum.photos/seed/soybean-grow/400/300"]', '示范县太平乡', '技术员老周', '技术员', '2025-07-20', '["生长周期：约90天","病虫害防治：物理+生物综合防治","追肥：花期磷钾肥"]', 0, '2025-07-20 00:00:00', '2025-07-20 00:00:00', 0);
INSERT INTO `trace_records` VALUES (24, 4, '黄豆', 'TY-HD-20260410', 'harvesting', '机械收割晾晒', '待豆荚成熟变黄、叶片脱落后采用联合收割机进行机械收割。收割后在晒场自然晾晒至含水量13%以下。', '["https://picsum.photos/seed/soybean-harvest/400/300"]', '示范县太平乡', '丰源粮油合作社', '合作社', '2025-09-20', '["亩产：约350斤","含水量：12.8%","收割方式：联合收割机"]', 0, '2025-09-20 00:00:00', '2025-09-20 00:00:00', 0);
INSERT INTO `trace_records` VALUES (25, 4, '黄豆', 'TY-HD-20260410', 'processing', '清选烘干分装', '经过风选去石除杂、低温烘干至含水量10%以下，再经色选机剔除霉变粒和异色粒。', '[]', '示范县粮油加工中心', '示范县粮油食品有限公司', '企业', '2026-03-08', '["色选精度：99.9%","含水量：9.5%","加工工序：风选→烘干→色选→计量"]', 0, '2026-03-08 00:00:00', '2026-03-08 00:00:00', 0);
INSERT INTO `trace_records` VALUES (26, 4, '黄豆', 'TY-HD-20260410', 'quality', '品质安全检测', '委托常德市粮油质量检验所检测，蛋白质含量高达40.2%，转基因检测为阴性，黄曲霉毒素未检出。', '["https://picsum.photos/seed/soybean-quality/400/300"]', '常德市粮油质量检验所', '检验员吴工', '检测机构', '2026-03-10', '["检测报告编号：CD-2026-HD-0310","蛋白质含量：40.2%","转基因检测：阴性（非转基因）","黄曲霉毒素：未检出"]', 1, '2026-03-10 00:00:00', '2026-03-10 00:00:00', 0);
INSERT INTO `trace_records` VALUES (27, 4, '黄豆', 'TY-HD-20260410', 'packaging', '定量包装入库', '采用食品级编织袋真空包装，每袋2斤。外贴溯源标签、营养成分表和食用方法说明。', '[]', '示范县粮油加工中心', '示范县粮油食品有限公司', '企业', '2026-03-12', '["包装规格：2斤/袋","包装方式：真空包装","存储条件：阴凉干燥"]', 0, '2026-03-12 00:00:00', '2026-03-12 00:00:00', 0);
INSERT INTO `trace_records` VALUES (28, 4, '黄豆', 'TY-HD-20260410', 'logistics', '快递发出', '已由中通快递发出，常温运输，外层防水防潮包装保护。预计3-5个工作日送达。', '[]', '示范县物流中心', '中通快递', '物流企业', '2026-04-10', '["快递单号：ZT20260410HD001","运输方式：常温快递","预计送达：3-5天"]', 0, '2026-04-10 00:00:00', '2026-04-10 00:00:00', 0);
-- 商品5：玉米
INSERT INTO `trace_records` VALUES (29, 5, '玉米', 'TY-YM-20260405', 'planting', '甜玉米播种管理', '在凌津滩镇选用"金银粟"甜玉米品种，采用地膜覆盖穴播技术，行距60cm、株距30cm。', '["https://picsum.photos/seed/corn-plant/400/300"]', '示范县凌江镇', '金穗玉米合作社', '合作社', '2026-02-10', '["品种：金银粟甜玉米","种植面积：100亩","播种方式：地膜覆盖穴播"]', 0, '2026-02-10 00:00:00', '2026-02-10 00:00:00', 0);
INSERT INTO `trace_records` VALUES (30, 5, '玉米', 'TY-YM-20260405', 'growing', '田间培育管理', '及时查苗补苗确保全苗，大喇叭口期追施尿素促进穗分化。人工辅助授粉提高结实率。', '["https://picsum.photos/seed/corn-grow/400/300"]', '示范县凌江镇', '技术员小李', '技术员', '2026-03-20', '["授粉方式：人工辅助+自然风媒","灌溉方式：沟灌","重点防治：玉米螟、大小斑病"]', 0, '2026-03-20 00:00:00', '2026-03-20 00:00:00', 0);
INSERT INTO `trace_records` VALUES (31, 5, '玉米', 'TY-YM-20260405', 'harvesting', '鲜穗适期采摘', '授粉后22天左右采摘鲜穗，此时籽粒饱满、甜度最佳。折光糖度16度以上，保留2-3层苞叶保护。', '["https://picsum.photos/seed/corn-harvest/400/300"]', '示范县凌江镇', '采摘组老陈', '农户', '2026-04-01', '["采摘标准：授粉后22天","折光糖度：16度以上","运输时效：采摘后2小时内"]', 0, '2026-04-01 00:00:00', '2026-04-01 00:00:00', 0);
INSERT INTO `trace_records` VALUES (32, 5, '玉米', 'TY-YM-20260405', 'processing', '去须分级处理', '去除玉米须和多余苞叶，按长度进行分级（20cm以上为一级品）。处理全程低温操作保持鲜度。', '[]', '示范县农产品加工中心', '示范县农创科技有限公司', '企业', '2026-04-02', '["分级标准：一级品长度20cm以上","处理环境：低温操作"]', 0, '2026-04-02 00:00:00', '2026-04-02 00:00:00', 0);
INSERT INTO `trace_records` VALUES (33, 5, '玉米', 'TY-YM-20260405', 'quality', '品质安全检测', '检测甜度、农药残留、重金属等指标，折光糖度17.2度，口感清甜软糯，品质优良。', '["https://picsum.photos/seed/corn-quality/400/300"]', '湖南省农产品质量检测中心', '检验员赵工', '检测机构', '2026-04-03', '["检测报告编号：HN-2026-YM-0403","折光糖度：17.2度","农残检测：未检出","检测结果：全部合格"]', 1, '2026-04-03 00:00:00', '2026-04-03 00:00:00', 0);
INSERT INTO `trace_records` VALUES (34, 5, '玉米', 'TY-YM-20260405', 'packaging', '分装贴标入库', '保鲜膜逐根包裹鲜穗，每袋4根装入透气网袋。预冷至0-2℃延长保鲜期。', '[]', '示范县农产品加工中心', '示范县农创科技有限公司', '企业', '2026-04-04', '["包装规格：4根/袋","预冷温度：0-2℃","保鲜方式：保鲜膜包裹+预冷"]', 0, '2026-04-04 00:00:00', '2026-04-04 00:00:00', 0);
INSERT INTO `trace_records` VALUES (35, 5, '玉米', 'TY-YM-20260405', 'logistics', '冷链物流配送', '已由顺丰冷链发出，全程0-5℃冷链运输。预计1-2个工作日送达。', '[]', '示范县物流中心', '顺丰冷链', '物流企业', '2026-04-05', '["快递单号：SF20260405YM001","运输方式：冷链","运输温度：0-5℃","预计送达：1-2天"]', 0, '2026-04-05 00:00:00', '2026-04-05 00:00:00', 0);
-- 商品6：奉节脐橙
INSERT INTO `trace_records` VALUES (36, 6, '奉节脐橙', 'FJ-QC-20260320', 'planting', '脐橙果园管理', '奉节县长江沿岸丘陵地带的脐橙果园，海拔200-600米，气候温和湿润。冬季清园施肥，修剪整形。', '["https://picsum.photos/seed/orange-orchard/400/300"]', '奉节县草堂镇脐橙基地', '奉节脐橙种植专业合作社', '合作社', '2025-12-01', '["果园面积：800亩","海拔：200-600米","树龄：8-15年","产地：重庆奉节"]', 0, '2025-12-01 00:00:00', '2025-12-01 00:00:00', 0);
INSERT INTO `trace_records` VALUES (37, 6, '奉节脐橙', 'FJ-QC-20260320', 'growing', '挂果期精细管理', '春季施催芽肥，花期喷施硼肥保花保果。夏季疏果定果，控制叶果比50:1确保果实品质。果实套袋防虫防晒。', '["https://picsum.photos/seed/orange-grow/400/300"]', '奉节县草堂镇脐橙基地', '技术员何师傅', '技术员', '2026-01-15', '["疏果标准：叶果比50:1","套袋率：100%","施肥方案：催芽肥+硼肥"]', 0, '2026-01-15 00:00:00', '2026-01-15 00:00:00', 0);
INSERT INTO `trace_records` VALUES (38, 6, '奉节脐橙', 'FJ-QC-20260320', 'harvesting', '鲜果适期采摘', '待果面着色率达90%以上时采摘，采用"一果两剪"法，选择晴天露水干后采收。', '["https://picsum.photos/seed/orange-harvest/400/300"]', '奉节县草堂镇脐橙基地', '采摘队老向', '农户', '2026-03-10', '["采摘标准：着色率90%以上","果径：75-85mm","采摘方法：一果两剪法"]', 0, '2026-03-10 00:00:00', '2026-03-10 00:00:00', 0);
INSERT INTO `trace_records` VALUES (39, 6, '奉节脐橙', 'FJ-QC-20260320', 'processing', '清洗打蜡分级', '清水池滚刷清洗果面泥沙和杂质，食品级果蜡打蜡保鲜增加光泽度。经光电分选机按果径自动分级。', '[]', '奉节县脐橙分选中心', '奉节脐橙产业有限公司', '企业', '2026-03-12', '["分级规格：70/75/80/85mm四个等级","打蜡类型：食品级果蜡"]', 0, '2026-03-12 00:00:00', '2026-03-12 00:00:00', 0);
INSERT INTO `trace_records` VALUES (40, 6, '奉节脐橙', 'FJ-QC-20260320', 'quality', '品质安全检测', '委托重庆市农产品质量安全检测中心检测，可溶性固形物13.5%，维C含量45.6mg/100ml，口感酸甜适口。', '["https://picsum.photos/seed/orange-quality/400/300"]', '重庆市农产品质量安全检测中心', '检验员黄工', '检测机构', '2026-03-15', '["检测报告编号：CQ-2026-QC-0315","可溶性固形物：13.5%","维C含量：45.6mg/100ml","检测结果：全部合格"]', 1, '2026-03-15 00:00:00', '2026-03-15 00:00:00', 0);
INSERT INTO `trace_records` VALUES (41, 6, '奉节脐橙', 'FJ-QC-20260320', 'packaging', '精品礼盒包装', '每颗脐橙独立发泡网套保护，装入奉节脐橙专用彩印纸箱（5kg/箱，约12-15个）。内附溯源卡。', '[]', '奉节县脐橙分选中心', '奉节脐橙产业有限公司', '企业', '2026-03-18', '["包装规格：5kg/箱（约12-15个）","内附：溯源卡","包装类型：彩印专用纸箱"]', 0, '2026-03-18 00:00:00', '2026-03-18 00:00:00', 0);
INSERT INTO `trace_records` VALUES (42, 6, '奉节脐橙', 'FJ-QC-20260320', 'logistics', '冷链物流发出', '已由顺丰冷链发出，全程5-10℃冷藏运输。预计2-4个工作日送达。', '[]', '奉节县物流中心', '顺丰冷链', '物流企业', '2026-03-20', '["快递单号：SF20260320QC001","运输方式：冷链","运输温度：5-10℃","预计送达：2-4天"]', 0, '2026-03-20 00:00:00', '2026-03-20 00:00:00', 0);
-- 商品7：铜制茶器
INSERT INTO `trace_records` VALUES (43, 7, '铜制茶器', 'TY-TCQ-20260325', 'planting', '铜材与工具备选', '采购云南高纯度紫铜板（纯度99.9%），准备锻造锤、砧板、錾刻工具等传统手工工具。', '["https://picsum.photos/seed/teaset-material/400/300"]', '示范县铜艺工坊', '铜艺工坊采购部', '企业', '2026-01-10', '["铜材：云南紫铜","纯度：99.9%","检测方式：光谱仪"]', 0, '2026-01-10 00:00:00', '2026-01-10 00:00:00', 0);
INSERT INTO `trace_records` VALUES (44, 7, '铜制茶器', 'TY-TCQ-20260325', 'growing', '器型设计制图', '由铜艺传承人亲自设计茶器器型，套件包含一壶、一公道杯、六只茶杯。设计风格为唐风古韵。', '["https://picsum.photos/seed/teaset-design/400/300"]', '示范县铜艺工坊设计室', '传承人马师傅', '技师', '2026-02-01', '["套件：一壶一公道杯六茶杯","设计风格：唐风古韵","设计方式：手绘制图+木模"]', 0, '2026-02-01 00:00:00', '2026-02-01 00:00:00', 0);
INSERT INTO `trace_records` VALUES (45, 7, '铜制茶器', 'TY-TCQ-20260325', 'harvesting', '手工锻造成型', '将铜板加热至600℃反复锻打成型，壶身、壶嘴、壶把分别锻造后银焊拼接。每套制作周期约7天。', '["https://picsum.photos/seed/teaset-forge/400/300"]', '示范县铜艺工坊', '铜匠马师傅', '手艺人', '2026-03-01', '["锻造温度：600℃","每套制作周期：约7天","焊接方式：银焊"]', 0, '2026-03-01 00:00:00', '2026-03-01 00:00:00', 0);
INSERT INTO `trace_records` VALUES (46, 7, '铜制茶器', 'TY-TCQ-20260325', 'processing', '錾刻精加工', '在壶身錾刻"梅兰竹菊"传统纹样，壶盖精细打磨确保气密性，整体做旧仿古处理呈现温润包浆质感。', '[]', '示范县铜艺工坊', '錾刻师周师傅', '手艺人', '2026-03-15', '["錾刻纹样：梅兰竹菊","表面处理：仿古包浆","气密性：壶盖精细打磨"]', 0, '2026-03-15 00:00:00', '2026-03-15 00:00:00', 0);
INSERT INTO `trace_records` VALUES (47, 7, '铜制茶器', 'TY-TCQ-20260325', 'quality', '成品质量检验', '逐套检验气密性（倒置不漏水为合格），光谱仪检测铜材纯度99.9%，合格率100%。', '["https://picsum.photos/seed/teaset-quality/400/300"]', '示范县铜艺工坊', '品控主管马先生', '检测机构', '2026-03-20', '["铜材纯度：99.9%","气密性测试：通过","合格率：100%","检验项目：气密性、纯度、焊接、光洁度"]', 1, '2026-03-20 00:00:00', '2026-03-20 00:00:00', 0);
INSERT INTO `trace_records` VALUES (48, 7, '铜制茶器', 'TY-TCQ-20260325', 'packaging', '礼盒封装入库', '每件茶器独立绒布袋包裹防刮花，装入实木展示礼盒。内附产品保养说明卡和收藏证书。', '[]', '示范县铜艺工坊', '铜艺工坊包装组', '企业', '2026-03-22', '["包装：实木展示礼盒","内附：保养卡+收藏证书","保护：绒布袋独立包裹"]', 0, '2026-03-22 00:00:00', '2026-03-22 00:00:00', 0);
INSERT INTO `trace_records` VALUES (49, 7, '铜制茶器', 'TY-TCQ-20260325', 'logistics', '保价快递发出', '已由顺丰保价快递发出，多层防震包装确保运输安全，保价金额200元。预计2-3个工作日送达。', '[]', '示范县物流中心', '顺丰快递', '物流企业', '2026-03-25', '["快递单号：SF20260325TCQ001","保价金额：200元","包装：多层防震","预计送达：2-3天"]', 0, '2026-03-25 00:00:00', '2026-03-25 00:00:00', 0);
-- 商品8：熊猫书签
INSERT INTO `trace_records` VALUES (50, 8, '熊猫书签', 'TY-XMSJ-20260401', 'planting', '合金原料备选', '采购环保锌合金材料、电镀用金水和环保珐琅颜料。所有原材料通过RoHS环保认证。', '["https://picsum.photos/seed/bookmark-material/400/300"]', '示范县文创产业园', '示范县乡村文创有限公司', '企业', '2026-02-15', '["材料：环保锌合金","环保认证：RoHS","颜料：环保珐琅"]', 0, '2026-02-15 00:00:00', '2026-02-15 00:00:00', 0);
INSERT INTO `trace_records` VALUES (51, 8, '熊猫书签', 'TY-XMSJ-20260401', 'growing', '熊猫造型设计', '设计师以大熊猫为原型绘制Q版萌系熊猫造型，3D建模输出精密模具图纸。成品尺寸8x3cm。', '["https://picsum.photos/seed/bookmark-design/400/300"]', '示范县文创产业园设计部', '设计师小林', '技师', '2026-03-01', '["设计风格：Q版萌系熊猫","尺寸：8x3cm","设计流程：草图→3D建模→模具图纸"]', 0, '2026-03-01 00:00:00', '2026-03-01 00:00:00', 0);
INSERT INTO `trace_records` VALUES (52, 8, '熊猫书签', 'TY-XMSJ-20260401', 'harvesting', '模具开发压铸', '精密钢模具采用CNC五轴加工中心制作，加工精度0.01mm。锌合金高温压铸成型。', '[]', '示范县文创产业园生产车间', '示范县乡村文创有限公司', '企业', '2026-03-10', '["模具精度：0.01mm","成型方式：锌合金压铸","加工设备：CNC五轴加工中心"]', 0, '2026-03-10 00:00:00', '2026-03-10 00:00:00', 0);
INSERT INTO `trace_records` VALUES (53, 8, '熊猫书签', 'TY-XMSJ-20260401', 'processing', '电镀上色抛光', '金色电镀底色赋予金属光泽，珐琅填色以黑白两色为主、竹叶点缀绿色。超声波清洗后精细抛光。', '[]', '示范县文创产业园生产车间', '示范县乡村文创有限公司', '企业', '2026-03-18', '["电镀：金色底色","填色：珐琅彩（黑白+竹叶绿）","表面处理：超声波清洗+抛光"]', 0, '2026-03-18 00:00:00', '2026-03-18 00:00:00', 0);
INSERT INTO `trace_records` VALUES (54, 8, '熊猫书签', 'TY-XMSJ-20260401', 'quality', '成品质量检验', '抽检外观无毛刺、无色差、镀层均匀。通过SGS重金属安全检测，确保长期接触安全。', '["https://picsum.photos/seed/bookmark-quality/400/300"]', '示范县文创产业园', '品控组林主管', '检测机构', '2026-03-22', '["SGS检测：通过","重金属含量：符合标准","外观检验：无毛刺无色差","尺寸精度：±0.5mm"]', 1, '2026-03-22 00:00:00', '2026-03-22 00:00:00', 0);
INSERT INTO `trace_records` VALUES (55, 8, '熊猫书签', 'TY-XMSJ-20260401', 'packaging', '独立卡片包装', '每枚书签装入透明PVC卡套，粘贴在熊猫主题背卡上。20枚装一盒。', '[]', '示范县文创产业园', '示范县乡村文创有限公司', '企业', '2026-03-28', '["包装：PVC卡套+熊猫背卡","盒装：20枚/盒","展示方式：独立卡片式"]', 0, '2026-03-28 00:00:00', '2026-03-28 00:00:00', 0);
INSERT INTO `trace_records` VALUES (56, 8, '熊猫书签', 'TY-XMSJ-20260401', 'logistics', '快递发出', '已由中通快递发出，气泡袋防压包装保护书签不变形。预计3-5个工作日送达。', '[]', '示范县物流中心', '中通快递', '物流企业', '2026-04-01', '["快递单号：ZT20260401XMSJ01","包装：气泡袋防压","预计送达：3-5天"]', 0, '2026-04-01 00:00:00', '2026-04-01 00:00:00', 0);

-- ============================================================
-- 数据库对象（视图、函数、存储过程、触发器）
-- ============================================================

-- ----------------------------
-- View structure for attractions_location_check
-- ----------------------------
DROP VIEW IF EXISTS `attractions_location_check`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `attractions_location_check` AS select `attractions`.`id` AS `id`,`attractions`.`name` AS `name`,`attractions`.`longitude` AS `longitude`,`attractions`.`latitude` AS `latitude`,`attractions`.`address` AS `address`,(case when ((`attractions`.`longitude` is null) or (`attractions`.`latitude` is null)) then '缺少坐标' when ((`attractions`.`longitude` < -(180)) or (`attractions`.`longitude` > 180)) then '经度超出范围' when ((`attractions`.`latitude` < -(90)) or (`attractions`.`latitude` > 90)) then '纬度超出范围' when ((`attractions`.`address` is null) or (`attractions`.`address` = '')) then '缺少地址' else '数据完整' end) AS `location_status` from `attractions` where (`attractions`.`deleted` = 0);

-- ----------------------------
-- View structure for attractions_location_stats
-- ----------------------------
DROP VIEW IF EXISTS `attractions_location_stats`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `attractions_location_stats` AS select count(0) AS `total_attractions`,count((case when ((`attractions`.`longitude` is not null) and (`attractions`.`latitude` is not null)) then 1 end)) AS `with_coordinates`,count((case when ((`attractions`.`longitude` is null) or (`attractions`.`latitude` is null)) then 1 end)) AS `without_coordinates`,round(((count((case when ((`attractions`.`longitude` is not null) and (`attractions`.`latitude` is not null)) then 1 end)) * 100.0) / count(0)),2) AS `coordinate_coverage_percent`,min(`attractions`.`longitude`) AS `min_longitude`,max(`attractions`.`longitude`) AS `max_longitude`,min(`attractions`.`latitude`) AS `min_latitude`,max(`attractions`.`latitude`) AS `max_latitude` from `attractions` where (`attractions`.`deleted` = 0);

-- ----------------------------
-- Function structure for GetAttractionHeatmapData
-- ----------------------------
DROP FUNCTION IF EXISTS `GetAttractionHeatmapData`;
delimiter ;;
CREATE FUNCTION `GetAttractionHeatmapData`(`grid_size` DECIMAL(8,6))
 RETURNS json
  READS SQL DATA 
  DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'lng', ROUND(`longitude` / grid_size) * grid_size,
            'lat', ROUND(`latitude` / grid_size) * grid_size,
            'count', COUNT(*),
            'avg_rating', ROUND(AVG(`rating`), 2),
            'total_views', SUM(`view_count`)
        )
    ) INTO result
    FROM `attractions`
    WHERE 
        `deleted` = 0 
        AND `status` = 1 
        AND `longitude` IS NOT NULL 
        AND `latitude` IS NOT NULL
    GROUP BY 
        ROUND(`longitude` / grid_size), 
        ROUND(`latitude` / grid_size);
    
    RETURN IFNULL(result, JSON_ARRAY());
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for SearchAttractionsByDistance
-- ----------------------------
DROP PROCEDURE IF EXISTS `SearchAttractionsByDistance`;
delimiter ;;
CREATE PROCEDURE `SearchAttractionsByDistance`(IN `center_lng` DECIMAL(10,6),
    IN `center_lat` DECIMAL(10,6), 
    IN `radius_km` DECIMAL(10,2),
    IN `limit_count` INT)
BEGIN
    -- 使用 Haversine 公式计算距离
    SELECT 
        `id`,
        `name`,
        `category_id`,
        `description`,
        `cover_image`,
        `longitude`,
        `latitude`,
        `address`,
        `rating`,
        `ticket_price`,
        `status`,
        -- 计算距离（公里）
        (6371 * ACOS(
            COS(RADIANS(center_lat)) * 
            COS(RADIANS(`latitude`)) * 
            COS(RADIANS(`longitude`) - RADIANS(center_lng)) + 
            SIN(RADIANS(center_lat)) * 
            SIN(RADIANS(`latitude`))
        )) AS `distance_km`
    FROM `attractions`
    WHERE 
        `deleted` = 0 
        AND `status` = 1
        AND `longitude` IS NOT NULL 
        AND `latitude` IS NOT NULL
        -- 使用简单的边界框预过滤，提高性能
        AND `longitude` BETWEEN (center_lng - radius_km/111.0) AND (center_lng + radius_km/111.0)
        AND `latitude` BETWEEN (center_lat - radius_km/111.0) AND (center_lat + radius_km/111.0)
    HAVING `distance_km` <= radius_km
    ORDER BY `distance_km` ASC
    LIMIT limit_count;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table attractions
-- ----------------------------
DROP TRIGGER IF EXISTS `attractions_location_validate`;
delimiter ;;
CREATE TRIGGER `attractions_location_validate` BEFORE UPDATE ON `attractions` FOR EACH ROW BEGIN
    -- 验证经度范围
    IF NEW.longitude IS NOT NULL AND (NEW.longitude < -180 OR NEW.longitude > 180) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '经度必须在-180到180之间';
    END IF;
    
    -- 验证纬度范围  
    IF NEW.latitude IS NOT NULL AND (NEW.latitude < -90 OR NEW.latitude > 90) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '纬度必须在-90到90之间';
    END IF;
    
    -- 如果提供了坐标，确保两个都不为空
    IF (NEW.longitude IS NOT NULL AND NEW.latitude IS NULL) OR 
       (NEW.longitude IS NULL AND NEW.latitude IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '经度和纬度必须同时提供或同时为空';
    END IF;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
