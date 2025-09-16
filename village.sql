/*
 Navicat Premium Data Transfer

 Source Server         : mysql80
 Source Server Type    : MySQL
 Source Server Version : 80037
 Source Host           : localhost:3306
 Source Schema         : village

 Target Server Type    : MySQL
 Target Server Version : 80037
 File Encoding         : 65001

 Date: 15/09/2025 21:05:39
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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
INSERT INTO `address` VALUES (1, 8, '李四', '13800138000', '湖南省', '长沙市', '岳麓区', '桃源路123号', 0, '2025-09-10 16:25:24', '2025-09-11 14:48:32', 0);
INSERT INTO `address` VALUES (2, 8, '李四', '13800138001', '湖南省', '常德市', '桃源县', '桃花源景区附近', 1, '2025-09-10 16:25:24', '2025-09-11 14:48:32', 0);
INSERT INTO `address` VALUES (3, 8, '潇潇', '18276298374', '湖南省', '长沙市', '岳麓区', '地铁口旁边', 0, '2025-09-11 14:48:29', '2025-09-11 14:48:29', 0);
INSERT INTO `address` VALUES (4, 9, '潇潇', '18276287425', '湖北省', '武汉市', '江汉区', '地铁口附近', 1, '2025-09-11 16:44:34', '2025-09-11 16:44:36', 0);

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
INSERT INTO `attractions` VALUES (1, '桃花源景区', 1, '常德市桃花源旅游区 ，简称桃花源旅游区，是位于湖南省常德市桃源县桃花源镇境内的旅游景区，桃花源旅游区总面积142.48平方千米，核心景区面积约20平方千米。\n桃花源始建于秦代，到唐宋时发展到鼎盛阶段，在元代时毁于战乱，明清以后又开始复兴。历代以来，陶渊明、李白、刘禹锡、苏轼、孟浩然、韩愈等大文豪都在此留下了许多珍贵的诗文和墨迹。桃花源在历史上就是中国古代道教圣地之一。', '/api/file/download/e0f3b9d2-120a-4b4e-b434-02d18750f757.jpg', '[\"/images/attractions/taoyuan_1.jpg\",\"/images/attractions/taoyuan_2.jpg\"]', '/panorama/taoyuan_360.jpg', 111.436437, 28.781719, '桃花源风景区', '报团旅游或者自驾游都支持', '08:00-17:00', 80.00, 4.50, 1554, 1, 1, '2025-09-09 10:19:20', '2025-09-15 19:50:40', 0);
INSERT INTO `attractions` VALUES (2, '世界桃林博览园', 1, '世界桃林博览园位于桃仙岭，分为六大板块，包括桃花源牌楼、世界桃林博览园、桃花山水、桃花果林、桃花田园及桃花村，共种植100多个品种，16450余株桃树。每当桃花盛开的季节，万亩桃林，红云漂浮，赤霞腾飞，与沿溪松涛竹风映照，瑰丽多彩。 ', '/api/file/download/76ee38fc-be70-4747-8679-a8bd77c38d61.jpg', '[\"/images/attractions/village_1.jpg\",\"/images/attractions/village_2.jpg\"]', NULL, 111.443196, 28.790702, '世界桃林博览园', '自驾游最佳，先到桃源古镇', '09:00-17:30', 50.00, 4.30, 902, 1, 2, '2025-09-09 10:19:20', '2025-09-15 20:08:25', 0);
INSERT INTO `attractions` VALUES (4, '桃川万寿宫', 1, '桃川万寿宫又称桃川宫，位于桃源山山腰，水府阁东北方向。明嘉靖《常德府志》载：“桃川宫，晋人建。”原名桃源观，是桃花源有记载的最早建筑。公元1112年，宋徽宗钦赐御书“桃川万寿宫”匾额，香火达到极盛，呈现“四十八层庵，走马关山门”的盛况。现于原址复建上、中、下三宫，道观宏敞，古木垂荫，蔚然深秀，被誉为“江南第一宫”。', '/api/file/download/a4e53f65-512c-4555-af87-6162a6ea3abc.jpg', '[\"/images/attractions/taoyuan_1.jpg\",\"/images/attractions/taoyuan_2.jpg\"]', NULL, 111.435865, 28.774817, '桃川万寿宫', '自驾游，和亲朋好友最佳', '06:00-18:00', 25.00, 4.20, 120, 1, 3, '2025-09-08 10:30:00', '2025-09-15 20:11:05', 0);
INSERT INTO `attractions` VALUES (5, '桃花源古镇', 2, '桃花源古镇以江南风情的精品园林搭配浓郁潇湘地方特色的古建筑艺术为核心依托，完美展现传承数千年的湖湘民俗文化。古镇既能领略明清建筑文化，又有江南小桥流水的韵味。古戏台、姻缘楼、综艺馆、城隍庙、傩堂、伏波楼美景不断；游玩之间享 受不一样的江南流水。正是那“游山玩水桃花源，寻花问柳在古镇”。', '/api/file/download/fa396be7-d06b-4e18-b90a-a32f65388ab0.jpg', '[\"/images/attractions/village_1.jpg\",\"/images/attractions/village_2.jpg\"]', NULL, 111.425859, 28.775866, '桃花源古镇', '自驾游最佳、穷游富游不如 少年游', '05:00-20:00', 10.00, 4.00, 85, 1, 4, '2025-09-10 14:20:00', '2025-09-15 20:13:07', 0);
INSERT INTO `attractions` VALUES (6, '五柳湖', 1, '五柳湖是以东晋大诗人陶渊明自号“五柳先生”而命名。它位于桃花山与桃源山之间，以湖水为纽带，实现两山之间的天然融合。五里湖两岸有刘禹锡的陋室、“桃源佳致”碑亭等景点。', '/api/file/download/cca077e5-f8fe-4a9c-9e50-9dd968534dc6.jpg', '[\"/images/attractions/taoyuan_1.jpg\",\"/images/attractions/taoyuan_2.jpg\"]', NULL, 111.440585, 28.792419, '五柳湖', '步行即可', '08:00-17:00', 35.00, 4.60, 200, 1, 5, '2025-09-13 09:15:00', '2025-09-15 20:16:52', 0);
INSERT INTO `attractions` VALUES (7, '秦谷', 1, '秦谷，土地平旷，屋舍俨然，有良田美池桑竹之属。秦谷南临秦溪，北接桃花山，通谷游线约3.7千米，是《桃花源记》的实景再现。谷内由桃花洞、洞天驿馆、寰楼、天工六艺坊、扶疏园，烟雨楼等20多个景点组成。', '/api/file/download/9c9138a3-5ecd-4d60-b4d0-cf132c782607.jpg', '[\"/images/attractions/village_1.jpg\",\"/images/attractions/village_2.jpg\"]', NULL, 111.442558, 28.787958, '湖南省常德市桃源县桃源秦谷', '自驾游、漫步皆可', '24小时', 20.00, 4.20, 1, 1, 10, '2025-09-15 14:56:16', '2025-09-15 20:37:47', 0);
INSERT INTO `attractions` VALUES (8, '桃花山', 1, '桃花山是纪念并体现陶渊明以及《桃花源诗并序》的“陶公山”，体现历朝历代隐逸文化的“隐士山”，更是留下多位文人墨客足迹的“名人山”，展现诗词楹联碑刻之韵的“国宝山”。', '/api/file/download/d3121bc9-71ae-40b2-9012-3ba39790209c.jpg', '[\"/images/attractions/taoyuan_1.jpg\",\"/images/attractions/taoyuan_2.jpg\"]', NULL, 111.442522, 28.781825, '湖南省常德市桃源县桃花山', '适合漫步', '08:00-18:00', 30.00, 4.10, 0, 1, 11, '2025-09-15 14:56:16', '2025-09-15 20:21:29', 0);
INSERT INTO `attractions` VALUES (9, '桃源山', 1, '桃源山又名黄闻山，位于沅江南岸。这里是桃花源洞天福地的源头，自东晋起便是沅水流域道教文化中心。山中有水府阁、桃川万寿宫、桃川书院三大建筑群落。来到桃源山，既可朝圣仙气缭绕的“桃川香火”，又可领略古潇湘八景之一的“渔村夕照”妙境。山水人文融于一体，开桃花源方外之“境”。', '/api/file/download/576066cb-9ec0-42b0-bee5-e0741324ce8e.jpg', '[\"/images/attractions/village_1.jpg\",\"/images/attractions/village_2.jpg\"]', NULL, 111.434906, 28.777185, '湖南省常德市桃源县桃源山', '漫步即可', '09:00-17:00', 20.00, 3.90, 0, 1, 12, '2025-09-15 14:56:16', '2025-09-15 20:23:13', 0);

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
INSERT INTO `news` VALUES (1, '桃源县获评全国乡村振兴示范县', '我县在乡村振兴工作中取得显著成效，获得国家级荣誉', '<p>近日，桃源县被农业农村部评为全国乡村振兴示范县...</p>', '/api/file/download/21d24a9d-b977-4007-ac15-a5a944b9fe77.jpg', 'news', '县政府办公室', '桃源日报', 502, 0, 1, '2025-09-08 22:22:28', 1, 1, '2025-09-09 10:19:20', '2025-09-15 20:47:20', 0);
INSERT INTO `news` VALUES (2, '春季桃花节即将开幕', '一年一度的桃花节将于3月15日盛大开幕，欢迎各界朋友前来赏花', '<p>春暖花开，桃花盛放。我县第十届桃花节将于3月15日...</p>', '/api/file/download/d30de0e4-a0d3-4331-89c8-6d719d32cb6c.jpg', 'activity', '旅游局', '桃源旅游', 800, 0, 1, '2025-09-10 06:34:51', 1, 2, '2025-09-09 10:19:20', '2025-09-15 20:43:02', 0);
INSERT INTO `news` VALUES (5, '创新改革实打实 便民服务心贴心——汉县不动产登记中心工作纪实', '县政府投资建设现代化智慧农业示范基地', '8月26日是汉寿县不动产登记中心挂牌成立9周年的日子。9年来，县不动产登记中心在汉寿县委县政府和县自然资源局党组的坚强领导下，在省、市主管部门及全县各部门的支持配合下，始终秉持“便民利民、高效服务、改革创新”的理念，以实实在在的行动推动不动产登记工作提质增效，赢得社会各界广泛好评。\n<br/>\n打造优质服务窗口，提升群众办事体验\n<br/>\n县不动产登记中心自成立以来，高度重视服务窗口建设，推行着装规范、微笑服务及普通话接待。服务大厅内设有醒目的办事指南，便于群众取阅。近年来，县不动产登记中心持续优化办理流程，将原有按业务分类受理的模式，升级为“一窗受理、并行办理”的综合服务，大幅减少群众排队次数。经过5次业务大提速，登记办理时限由法定的30个工作日压缩至2个工作日以内。\n<br/>\n2023年，县不动产登记中心联合县数据局、县税务局等部门出台《汉寿县不动产登记“高效办成一件事”实施方案》，设立“一件事”专窗，整合不动产登记、交易以及水、电、气过户等事项，推行“一表申请”模式，申请材料精简至5份。截至目前，已联动办理860笔不动产登记及水、电、气联动过户业务。\n<br/>\n此外，县不动产登记中心积极推动党建与业务深度融合，打造“不动产登记+党建”服务品牌，设立“党员先锋岗”和“学雷锋上门服务小组”，开展工作日“早开晚关”、周末“不打烊”服务，并实行主任值班和延时服务机制，切实为群众提供便利，实现登记质量与服务作风“双提升”。9年来，县不动产登记中心荣获多项荣誉。\n<br/>\n深化制度改革，破解群众急难愁盼\n<br/>\n作为自然资源领域改革的前沿阵地，县不动产登记中心积极落实国家各项惠民政策，持续推进制度创新。2020年，全省农村宅基地和集体建设用地房地一体确权登记试点工作在汉寿开展，县不动产登记中心积极探索，形成可复制、可推广的经验做法。\n<br/>\n同时，全县新建商品房实现“交房即交证”常态化，从根本上预防“办证难”问题。自2020年以来，县不动产登记中心负责人带头攻坚，成功化解锦阳丰瑞、东方美景等34个楼盘存在的问题，为7265户群众解决不动产登记历史遗留难题。', '/api/file/download/6ede5435-3139-46e0-b823-831b392a0eb2.jpg', 'policy', '黎自来 通讯员 童坤 施祥 高昆明', '常德日报', 95, 1, 1, '2025-09-06 17:20:00', 1, 5, '2025-09-08 09:20:00', '2025-09-15 20:47:10', 0);
INSERT INTO `news` VALUES (6, '“常德好物”亮相长沙', '汉寿禾田甲食品有限公司等企业在长沙市举办了“常德好物”专场推介活动。', '日前，市商务局以2025年“德商恳谈会—长沙行”活动为契机，组织湖南中烟工业有限责任公司、湖南德山酒业有限公司、湖南武陵红茶业有限公司、湖南湘佳牧业股份有限公司、湖南鑫三香常德米粉集团有限公司、汉寿禾田甲食品有限公司等企业在长沙市举办了“常德好物”专场推介活动。\n<br/>\n推介会现场，参加活动的各企业携核心产品精彩亮相。“德酱”系列白酒、“武陵红”茶、“湘佳黑猪”肉制品、“鑫三香”常德米粉、“汉寿甲鱼”等一系列具有常德地理标志和地域特色的产品吸引了大批企业家及消费者的广泛关注。活动现场洽谈氛围浓厚，有效提升了常德地标优质产品的知名度和影响力。\n<br/>\n此次活动是常德市深化区域合作、拓展消费市场的重要举措之一，不仅为常德优质产品搭建了对外展示的窗口，也为两地企业进一步合作提供了良好平台。下一步，市商务局将继续依托各类展会、推介会等活动载体，推动更多“常德造”“常德产”名优特产品走出湖南、走向全国、迈入国际，助力全市经济高质量发展。', '/api/file/download/da79da85-97e0-4948-91f2-e568453c6aa4.jpg', 'policy', '刘颂 通讯员 代乐', '常德日报', 158, 1, 1, '2025-09-10 08:30:00', 1, 6, '2025-09-10 16:30:00', '2025-09-15 20:47:16', 0);
INSERT INTO `news` VALUES (7, '农产品电商平台上线', '县域农产品电商平台正式上线运营', '<p>为拓宽农产品销售渠道...</p>', '/api/file/download/70c87520-8e11-438e-b316-e8ef22958f08.jpg', 'news', '商务局', '桃源电商', 236, 0, 0, '2025-09-12 03:45:00', 1, 7, '2025-09-12 11:45:00', '2025-09-15 20:46:56', 0);
INSERT INTO `news` VALUES (8, '生态环境治理成效显著', '全县生态环境质量持续改善', '<p>今年以来，我县大力推进生态环境治理...</p>', '/api/file/download/f456f189-cfe0-4cab-92af-6a34af2add39.jpg', 'news', '环保局', '桃源环保', 178, 0, 1, '2025-09-14 06:10:00', 1, 8, '2025-09-14 14:10:00', '2025-09-15 20:48:05', 0);

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
INSERT INTO `order_items` VALUES (1, 1, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '桃源县', '2025-09-11 11:08:39');
INSERT INTO `order_items` VALUES (2, 2, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '桃源县', '2025-09-11 11:08:40');
INSERT INTO `order_items` VALUES (3, 3, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '桃源县', '2025-09-11 11:08:41');
INSERT INTO `order_items` VALUES (4, 3, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '桃源县', '2025-09-11 11:08:41');
INSERT INTO `order_items` VALUES (5, 4, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '桃源县', '2025-09-11 11:08:42');
INSERT INTO `order_items` VALUES (6, 5, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '桃源县', '2025-09-11 11:08:43');
INSERT INTO `order_items` VALUES (7, 6, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 2, 136.00, '桃源县', '2025-09-11 11:28:11');
INSERT INTO `order_items` VALUES (8, 6, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 3, 105.00, '桃源县', '2025-09-11 11:28:11');
INSERT INTO `order_items` VALUES (9, 7, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '桃源县', '2025-09-11 11:30:06');
INSERT INTO `order_items` VALUES (10, 8, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 2, 136.00, '桃源县', '2025-09-11 12:43:44');
INSERT INTO `order_items` VALUES (11, 9, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 2, 136.00, '桃源县', '2025-09-11 12:45:40');
INSERT INTO `order_items` VALUES (12, 10, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '桃源县', '2025-09-11 12:48:59');
INSERT INTO `order_items` VALUES (13, 11, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 2, 136.00, '桃源县', '2025-09-11 12:50:22');
INSERT INTO `order_items` VALUES (14, 12, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 3, 204.00, '桃源县', '2025-09-11 12:52:15');
INSERT INTO `order_items` VALUES (15, 13, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 2, 70.00, '桃源县', '2025-09-11 13:02:38');
INSERT INTO `order_items` VALUES (16, 14, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '桃源县', '2025-09-11 13:53:38');
INSERT INTO `order_items` VALUES (17, 15, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '桃源县', '2025-09-11 16:44:55');
INSERT INTO `order_items` VALUES (18, 16, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 2, 70.00, '桃源县', '2025-09-11 17:36:31');
INSERT INTO `order_items` VALUES (19, 17, 1, '桃源蜂蜜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 68.00, 1, 68.00, '桃源县', '2025-09-11 17:39:09');
INSERT INTO `order_items` VALUES (20, 18, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '桃源县', '2025-09-11 17:44:18');
INSERT INTO `order_items` VALUES (21, 19, 3, '桃源茶叶', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 128.00, 1, 128.00, '桃源县', '2025-09-07 10:30:01');
INSERT INTO `order_items` VALUES (22, 20, 4, '野生山菇', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 85.00, 1, 85.00, '桃源县', '2025-09-08 14:30:02');
INSERT INTO `order_items` VALUES (23, 21, 5, '手工豆腐', '/api/file/download/a4cf6bd5-79e7-4e65-a14b-c029cbe10862.png', 12.00, 2, 24.00, '桃源县', '2025-09-09 08:30:03');
INSERT INTO `order_items` VALUES (24, 22, 6, '桃源米酒', '/api/file/download/848c3b19-966c-443c-ad68-5b6bbc21d3fd.png', 58.00, 1, 58.00, '桃源县', '2025-09-10 17:30:04');
INSERT INTO `order_items` VALUES (25, 23, 3, '桃源茶叶', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 128.00, 1, 128.00, '桃源县', '2025-09-11 09:30:05');
INSERT INTO `order_items` VALUES (26, 23, 5, '手工豆腐', '/api/file/download/a4cf6bd5-79e7-4e65-a14b-c029cbe10862.png', 12.00, 2, 24.00, '桃源县', '2025-09-11 09:30:05');
INSERT INTO `order_items` VALUES (27, 23, 2, '手工竹编篮', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 35.00, 1, 35.00, '桃源县', '2025-09-11 09:30:05');
INSERT INTO `order_items` VALUES (28, 24, 4, '野生山菇', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 85.00, 1, 85.00, '桃源县', '2025-09-12 11:30:06');
INSERT INTO `order_items` VALUES (29, 24, 5, '手工豆腐', '/api/file/download/a4cf6bd5-79e7-4e65-a14b-c029cbe10862.png', 12.00, 1, 12.00, '桃源县', '2025-09-12 11:30:06');
INSERT INTO `order_items` VALUES (30, 25, 3, '桃源茶叶', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', 128.00, 1, 128.00, '桃源县', '2025-09-13 15:30:07');
INSERT INTO `order_items` VALUES (31, 25, 4, '野生山菇', '/api/file/download/6abaa6c9-0fc4-44c8-aa25-101589cb3a03.png', 85.00, 1, 85.00, '桃源县', '2025-09-13 15:30:07');

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
INSERT INTO `orders` VALUES (1, '2025091111083901', 2, 68.00, 0.00, 68.00, '支付宝', 0, 1, '湖南省常德市桃源县桃源大道123号', '张三', '13800138001', '尽快发货', NULL, NULL, NULL, NULL, NULL, '2025-09-11 11:08:39', '2025-09-11 11:08:39', 0);
INSERT INTO `orders` VALUES (2, '2025091111083902', 2, 35.00, 0.00, 35.00, '微信支付', 1, 2, '湖南省常德市桃源县桃源大道456号', '李四', '13800138002', '包装仔细点', '2025-09-11 11:10:00', NULL, NULL, NULL, NULL, '2025-09-11 11:08:40', '2025-09-11 11:10:00', 0);
INSERT INTO `orders` VALUES (3, '2025091111083903', 2, 103.00, 0.00, 103.00, '支付宝', 1, 3, '湖南省常德市桃源县桃源大道789号', '王五', '13800138003', '', '2025-09-11 11:12:00', '2025-09-11 14:30:00', NULL, NULL, NULL, '2025-09-11 11:08:41', '2025-09-11 14:30:00', 0);
INSERT INTO `orders` VALUES (4, '2025091111083904', 2, 68.00, 0.00, 68.00, '微信支付', 1, 4, '湖南省常德市桃源县桃源大道321号', '赵六', '13800138004', '已收货，很满意', '2025-09-11 11:15:00', '2025-09-11 15:00:00', '2025-09-11 18:00:00', NULL, NULL, '2025-09-11 11:08:42', '2025-09-11 18:00:00', 0);
INSERT INTO `orders` VALUES (5, '2025091111083905', 2, 35.00, 0.00, 35.00, '支付宝', 0, 5, '湖南省常德市桃源县桃源大道654号', '孙七', '13800138005', '', NULL, NULL, NULL, '2025-09-11 11:20:00', '用户取消', '2025-09-11 11:08:43', '2025-09-11 11:20:00', 0);
INSERT INTO `orders` VALUES (6, '20250911112811776250', 8, 241.00, 0.00, 241.00, 'alipay', 1, 4, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', '2025-09-11 11:28:16', '2025-09-11 11:29:08', '2025-09-11 11:29:15', NULL, NULL, '2025-09-11 11:28:11', '2025-09-11 11:29:15', 0);
INSERT INTO `orders` VALUES (7, '20250911113006826669', 8, 68.00, 0.00, 68.00, 'alipay', 1, 3, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', '2025-09-11 11:30:09', '2025-09-11 11:30:33', NULL, NULL, NULL, '2025-09-11 11:30:07', '2025-09-11 11:30:33', 0);
INSERT INTO `orders` VALUES (8, '20250911124344195785', 8, 136.00, 0.00, 136.00, 'alipay', 1, 2, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '222', '2025-09-11 12:43:49', NULL, NULL, NULL, NULL, '2025-09-11 12:43:44', '2025-09-11 12:43:49', 0);
INSERT INTO `orders` VALUES (9, '20250911124540743561', 8, 136.00, 0.00, 136.00, 'alipay', 1, 2, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', '2025-09-11 12:45:45', NULL, NULL, NULL, NULL, '2025-09-11 12:45:41', '2025-09-11 12:45:45', 0);
INSERT INTO `orders` VALUES (10, '20250911124859732217', 8, 35.00, 0.00, 35.00, 'alipay', 0, 5, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', NULL, NULL, NULL, '2025-09-11 12:49:22', '用户取消', '2025-09-11 12:49:00', '2025-09-11 12:49:22', 0);
INSERT INTO `orders` VALUES (11, '20250911125022187625', 8, 136.00, 0.00, 136.00, 'alipay', 1, 2, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', '2025-09-11 12:50:25', NULL, NULL, NULL, NULL, '2025-09-11 12:50:22', '2025-09-11 12:50:25', 0);
INSERT INTO `orders` VALUES (12, '20250911125215763263', 8, 204.00, 0.00, 204.00, 'alipay', 0, 5, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', NULL, NULL, NULL, '2025-09-11 13:40:06', '444', '2025-09-11 12:52:15', '2025-09-11 13:40:06', 0);
INSERT INTO `orders` VALUES (13, '20250911130238847605', 8, 70.00, 0.00, 70.00, 'wechat', 1, 2, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', '2025-09-11 13:02:41', NULL, NULL, NULL, NULL, '2025-09-11 13:02:39', '2025-09-11 13:02:41', 0);
INSERT INTO `orders` VALUES (14, '20250911135338748950', 8, 35.00, 0.00, 35.00, 'alipay', 0, 5, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', NULL, NULL, NULL, '2025-09-11 14:26:56', '不卖了！！', '2025-09-11 13:53:38', '2025-09-11 14:26:56', 0);
INSERT INTO `orders` VALUES (15, '20250911164455562310', 9, 35.00, 0.00, 35.00, 'alipay', 1, 2, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-11 16:44:56', NULL, NULL, NULL, NULL, '2025-09-11 16:44:55', '2025-09-11 16:44:56', 0);
INSERT INTO `orders` VALUES (16, '20250911173631254356', 9, 70.00, 0.00, 70.00, 'alipay', 1, 2, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-11 17:36:33', NULL, NULL, NULL, NULL, '2025-09-11 17:36:31', '2025-09-11 17:36:33', 0);
INSERT INTO `orders` VALUES (17, '20250911173909190165', 9, 68.00, 0.00, 68.00, 'alipay', 1, 4, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-11 17:39:11', '2025-09-11 17:39:22', '2025-09-11 17:39:28', NULL, NULL, '2025-09-11 17:39:09', '2025-09-11 17:39:28', 0);
INSERT INTO `orders` VALUES (18, '20250911174418364101', 9, 35.00, 0.00, 35.00, 'alipay', 1, 2, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-11 17:44:21', NULL, NULL, NULL, NULL, '2025-09-11 17:44:18', '2025-09-11 17:44:21', 0);
INSERT INTO `orders` VALUES (19, '20250907103001001', 8, 128.00, 0.00, 128.00, 'alipay', 1, 4, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '包装要仔细', '2025-09-07 10:30:05', '2025-09-07 11:00:00', '2025-09-07 18:30:00', NULL, NULL, '2025-09-07 10:30:01', '2025-09-07 18:30:00', 0);
INSERT INTO `orders` VALUES (20, '20250908143002002', 9, 85.00, 0.00, 85.00, 'wechat', 1, 3, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-08 14:30:08', '2025-09-08 15:00:00', NULL, NULL, NULL, '2025-09-08 14:30:02', '2025-09-08 15:00:00', 0);
INSERT INTO `orders` VALUES (21, '20250909083003003', 8, 24.00, 0.00, 24.00, 'alipay', 1, 4, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', '2025-09-09 08:30:10', '2025-09-09 09:00:00', '2025-09-09 16:20:00', NULL, NULL, '2025-09-09 08:30:03', '2025-09-09 16:20:00', 0);
INSERT INTO `orders` VALUES (22, '20250910173004004', 9, 58.00, 0.00, 58.00, 'alipay', 1, 2, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-10 17:30:12', NULL, NULL, NULL, NULL, '2025-09-10 17:30:04', '2025-09-10 17:30:12', 0);
INSERT INTO `orders` VALUES (23, '20250911093005005', 8, 170.00, 0.00, 170.00, 'wechat', 1, 4, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '多买点', '2025-09-11 09:30:15', '2025-09-11 10:00:00', '2025-09-11 17:45:00', NULL, NULL, '2025-09-11 09:30:05', '2025-09-11 17:45:00', 0);
INSERT INTO `orders` VALUES (24, '20250912113006006', 9, 96.00, 0.00, 96.00, 'alipay', 1, 3, '湖北省 武汉市 江汉区 地铁口附近', '潇潇', '18276287425', '', '2025-09-12 11:30:18', '2025-09-12 12:00:00', NULL, NULL, NULL, '2025-09-12 11:30:06', '2025-09-12 12:00:00', 0);
INSERT INTO `orders` VALUES (25, '20250913153007007', 8, 213.00, 0.00, 213.00, 'alipay', 1, 4, '湖南省 长沙市 岳麓区 桃源路123号', '李四', '13800138000', '', '2025-09-13 15:30:20', '2025-09-13 16:00:00', '2025-09-13 19:15:00', NULL, NULL, '2025-09-13 15:30:07', '2025-09-13 19:15:00', 0);

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
INSERT INTO `products` VALUES (1, '桃源蜂蜜', 1, '纯天然野生蜂蜜，甘甜醇厚，营养丰富', '/api/file/download/76cd5b84-3dad-47ec-b47a-d36ac4d5ba98.jpg', '[\"/images/products/honey_1.jpg\",\"/images/products/honey_2.jpg\"]', 68.00, 88.00, 480, 133, '瓶', 0.50, '{\"尺寸\":\"30x20x15cm\",\"材质\":\"天然蜂蜜\"}', '桃源县', 4.80, 2, 4.50, 1, 1, 1, '2025-09-09 10:19:20', '2025-09-15 20:26:56', 0);
INSERT INTO `products` VALUES (2, '手工竹编篮', 2, '传统工艺制作，环保实用，是家居装饰的好选择', '/api/file/download/edd57240-e91b-4674-8e2e-4cf520bcd1e4.jpg', '[\"/images/products/basket_1.jpg\",\"/images/products/basket_2.jpg\"]', 35.00, 45.00, 191, 76, '个', 0.30, '{\"尺寸\":\"30x20x15cm\",\"材质\":\"天然竹子\"}', '桃源县', 4.60, 1, 5.00, 1, 1, 2, '2025-09-09 10:19:20', '2025-09-15 20:28:16', 0);
INSERT INTO `products` VALUES (3, '桃源茶叶', 1, '高山云雾茶，清香甘甜', '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png', '[]', 128.00, 158.00, 200, 45, '盒', 0.25, '{\"规格\":\"250g/盒\",\"保质期\":\"24个月\"}', '桃源县', 4.70, 8, 4.60, 1, 1, 6, '2025-09-07 11:30:00', '2025-09-07 11:30:00', 0);
INSERT INTO `products` VALUES (4, '野生山菇', 1, '纯天然野生菌类', '/api/file/download/7b3906dd-7177-40e5-a5cb-724e0cac0f7f.jpg', '[]', 85.00, 100.00, 150, 28, '斤', 0.50, '{\"产地\":\"深山老林\",\"采摘季节\":\"春秋两季\"}', '桃源县', 4.40, 5, 4.40, 1, 0, 7, '2025-09-09 16:45:00', '2025-09-15 20:30:37', 0);
INSERT INTO `products` VALUES (5, '手工豆腐', 1, '传统工艺制作', '/api/file/download/d84d684d-c4f0-4e40-b8b6-ac503de652b8.jpg', '[]', 12.00, 15.00, 500, 120, '块', 0.30, '{\"制作工艺\":\"传统手工\",\"保存方式\":\"冷藏\"}', '桃源县', 4.20, 15, 4.30, 1, 0, 8, '2025-09-11 08:20:00', '2025-09-15 20:32:44', 0);
INSERT INTO `products` VALUES (6, '桃源米酒', 3, '传统酿造米酒', '/api/file/download/97a5d90a-283c-43cb-91dc-2c3ffd7328bd.jpg', '[]', 58.00, 68.00, 300, 67, '瓶', 0.75, '{\"酒精度\":\"12度\",\"容量\":\"500ml\"}', '桃源县', 4.50, 12, 4.50, 1, 1, 9, '2025-09-12 13:10:00', '2025-09-15 20:33:20', 0);

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
INSERT INTO `system_config` VALUES (1, 'system_name', '乡村振兴·新桃源智界', '系统名称', 'text', NULL, '基本设置', 1, '系统显示名称', '2025-09-08 16:55:07', '2025-09-08 17:47:53');
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
