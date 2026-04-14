package com.cinema.booking.service.ai.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cinema.booking.dto.ProductDTO;
import com.cinema.booking.entity.Attraction;
import com.cinema.booking.entity.News;
import com.cinema.booking.service.AttractionService;
import com.cinema.booking.service.ForumPostService;
import com.cinema.booking.service.NewsService;
import com.cinema.booking.service.ProductService;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 向量知识库同步服务
 * 负责将 MySQL 中的业务数据提取、清洗，并通过本地 MiniLM 模型向量化后存入 ChromaDB
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VectorSyncService {

    // 1. 注入现有的四大业务 Service
    private final ProductService productService;
    private final AttractionService attractionService;
    private final NewsService newsService;
    private final ForumPostService forumPostService;

    // 2. 注入 LangChain4j 核心组件（在 AiConfig 中配置的本地模型和 Chroma 库）
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    /**
     * 全量同步：一键将所有有效数据灌入 向量库
     */
    public void syncAllData() {
        log.info("🚀 启动知识库全量同步，准备提取 MySQL 数据...");

        // 获取四大模块的 Document 数据
        List<Document> allDocuments = new ArrayList<>();
//        allDocuments.addAll(fetchProductDocs());
        allDocuments.addAll(fetchAttractionDocs());
        allDocuments.addAll(fetchNewsDocs());
//        allDocuments.addAll(fetchForumDocs());

        if (allDocuments.isEmpty()) {
            log.warn("⚠️ 没有找到任何需要同步的数据！");
            return;
        }

        log.info("📦 共提取到 {} 条业务数据，准备使用本地 All-MiniLM 模型进行向量化...", allDocuments.size());

        try {
            // 使用 LangChain4j 1.3.0 推荐的 Ingestor 管道
            // 它会自动完成：Document -> TextSegment(分块) -> Embedding(向量化) -> Store(存入ChromaDB)
            EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                    .embeddingModel(embeddingModel)
                    .embeddingStore(embeddingStore)
                    .build();

            // 执行灌库
            ingestor.ingest(allDocuments);
            log.info("✅ 知识库全量同步圆满完成！数据已安全持久化到 Qdrant 。");

        } catch (Exception e) {
            log.error("❌ 向量化同步过程中发生严重异常：", e);
        }
    }

    /**
     * 提取【特产商城】数据
     */
//    private List<Document> fetchProductDocs() {
//        // 仅查询未删除 (deleted=0) 且已上架 (status=1) 的特产
//
//        List<ProductDTO> products = productService.listProductDTO(0, 1);
//
//        return products.stream()
//                .filter(Objects::nonNull) // 过滤空对象（防止空指针）
//                .map(p -> {
//                    // 1. 构造富文本语义（优化：更自然的语言，提升向量检索准确性）
//                    String content = String.format(
//                            "【特产商城】商品名称：%s。产地：%s。商品描述：%s。价格：%s元。",
//                            handleNull(p.getName()),
//                            handleNull(p.getOrigin()),
//                            handleNull(p.getDescription()),
//                            p.getPrice() != null ? String.format("%.2f", p.getPrice()) : "暂无"
//                    );
//
//                    // 2. 【核心优化】构造 Metadata（保留所有关键信息，后续检索直接用）
//                    Metadata metadata = Metadata.from("id", p.getId().toString()) // 必须：真实ID，反查MySQL
//                            .put("type", "PRODUCT")               // 必须：区分商品/景点
//                            .put("name", handleNull(p.getName()))  // 商品名称，检索结果直接显示
//                            .put("origin", handleNull(p.getOrigin())) // 产地
//                            .put("price", p.getPrice() != null ? String.valueOf(p.getPrice()) : "0.0") // 转String
//                            .put("categoryId", p.getCategoryId() != null ? String.valueOf(p.getCategoryId()) : "0"); // 转String
//
//                    // 3. 返回 Document（保留原有逻辑）
//                    return Document.from(content, metadata);
//                })
//                .toList();
//    }

    /**
     * 提取【景点导览】数据
     */
    /**
     * 提取【景点导览】数据
     */
    private List<Document> fetchAttractionDocs() {
        // 1. 仅查询未删除 (deleted=0) 且已启用 (status=1) 的景点（和商品保持一致）
        List<Attraction> attractions = attractionService.listAttractionDTO(0, 1);

        return attractions.stream()
                .filter(Objects::nonNull) // 过滤空对象，防止空指针
                .map(a -> {
                    // 2. 构造富文本语义（和商品格式统一，提升向量检索准确率）
                    String content = String.format(
                            "【景点导览】景点名称：%s。地址：%s。景点描述：%s。开放时间：%s。门票价格：%s元。交通指引：%s。评分：%s分。全景图链接：%s。",
                            handleNull(a.getName()),
                            handleNull(a.getAddress()),
                            handleNull(a.getDescription()),
                            handleNull(a.getOpeningHours()),
                            a.getTicketPrice() != null ? String.format("%.2f", a.getTicketPrice()) : "免费/暂无",
                            handleNull(a.getTrafficGuide()),
                            a.getRating() != null ? String.valueOf(a.getRating()) : "暂无评分",
                            handleNull(a.getPanoramaUrl())
                    );

                    // 3. 【核心】完善 Metadata（和商品结构统一，保留所有关键业务字段）
                    Metadata metadata = Metadata.from("id", a.getId().toString()) // 景点唯一ID
                            .put("type", "SCENIC")               // 模块类型：匹配枚举SCENIC
                            .put("name", handleNull(a.getName())) // 景点名称
                            .put("address", handleNull(a.getAddress())) // 详细地址
                            .put("description", handleNull(a.getDescription())) // 景点描述
                            .put("openingHours", handleNull(a.getOpeningHours())) // 开放时间
                            .put("ticketPrice", a.getTicketPrice() != null ? String.valueOf(a.getTicketPrice()) : "0.0") // 门票价格
                            .put("trafficGuide", handleNull(a.getTrafficGuide())) // 交通指引
                            .put("panoramaUrl", handleNull(a.getPanoramaUrl())) // 360°全景链接
                            .put("rating", a.getRating() != null ? String.valueOf(a.getRating()) : "0.00") // 评分
                            .put("longitude", a.getLongitude() != null ? String.valueOf(a.getLongitude()) : "0.000000") // 经度
                            .put("latitude", a.getLatitude() != null ? String.valueOf(a.getLatitude()) : "0.000000") // 纬度
                            .put("categoryId", a.getCategoryId() != null ? String.valueOf(a.getCategoryId()) : "0"); // 分类ID

                    // 4. 返回 Document（和商品完全一致）
                    return Document.from(content, metadata);
                })
                .toList();
    }

    /**
     * 提取【动态资讯】数据 (包含 HTML 清洗逻辑)
     */
    /**
     * 提取【动态资讯】数据
     */
    private List<Document> fetchNewsDocs() {
        // 1. 仅查询未删除 (deleted=0) 且已发布 (status=1) 的资讯（统一业务规则）
        List<News> newsList = newsService.listNewsDTO(0, 1);

        return newsList.stream()
                .filter(Objects::nonNull) // 统一过滤空对象，防止空指针
                .map(n -> {
                    // 2. 清洗HTML标签（保留原有核心逻辑，保证向量检索精准度）
                    String cleanContent = stripHtmlTags(n.getContent());

                    // 3. 统一富文本语义格式（和商品/景点完全对齐）
                    String content = String.format(
                            "【乡村资讯】资讯标题：%s。摘要：%s。分类：%s。作者：%s。来源：%s。发布时间：%s。正文内容：%s。",
                            handleNull(n.getTitle()),
                            handleNull(n.getSummary()),
                            handleNull(n.getCategory()),
                            handleNull(n.getAuthor()),
                            handleNull(n.getSource()),
                            // 格式化发布时间，无时间则显示暂无
                            n.getPublishTime() != null ? n.getPublishTime().toLocalDate().toString() : "暂无发布时间",
                            cleanContent
                    );

                    // 4. 【核心】完善Metadata（和商品/景点结构统一，全关键字段入库）
                    Metadata metadata = Metadata.from("id", n.getId().toString()) // 资讯唯一ID
                            .put("type", "NEWS") // 模块类型：严格匹配枚举NEWS
                            .put("title", handleNull(n.getTitle())) // 资讯标题
                            .put("summary", handleNull(n.getSummary())) // 资讯摘要
                            .put("category", handleNull(n.getCategory())) // 分类：news/policy/activity
                            .put("author", handleNull(n.getAuthor())) // 作者
                            .put("source", handleNull(n.getSource())) // 来源
                            .put("publishTime", n.getPublishTime() != null ? n.getPublishTime().toString() : "暂无") // 发布时间
                            .put("viewCount", String.valueOf(n.getViewCount() != null ? n.getViewCount() : 0)) // 浏览次数
                            .put("isTop", String.valueOf(n.getIsTop() != null ? n.getIsTop() : 0)) // 是否置顶
                            .put("isFeatured", String.valueOf(n.getIsFeatured() != null ? n.getIsFeatured() : 0)); // 是否推荐

                    // 5. 统一返回Document格式
                    return Document.from(content, metadata);
                })
                .toList();
    }

    /**
     * 提取【建言献策】数据
     */
//    private List<Document> fetchForumDocs() {
//        List<ForumPost> posts = forumPostService.list(new LambdaQueryWrapper<ForumPost>()
//                .eq(ForumPost::getDeleted, 0)
//                .eq(ForumPost::getStatus, 1)); // 假设 status 1 为已通过/显示状态
//
//        return posts.stream().map(f -> {
//            String content = String.format("【村民建言】分类：%s。标题：%s。内容：%s",
//                    handleNull(f.getCategory()),
//                    f.getTitle(),
//                    handleNull(f.getContent()));
//
//            Metadata metadata = Metadata.from("id", f.getId().toString())
//                    .add("type", "FORUM");
//
//            return Document.from(content, metadata);
//        }).toList();
//    }

    // ==================== 工具方法 ====================

    /**
     * 处理 Null 字符串，防止拼接到 Prompt 中出现 "null" 字符串
     */
    private String handleNull(String str) {
        return StringUtils.hasText(str) ? str : "暂无";
    }

    /**
     * 简单的 HTML 标签清洗器（正则提取纯文本）
     */
    private String stripHtmlTags(String html) {
        if (!StringUtils.hasText(html)) {
            return "暂无";
        }
        // 移除所有 HTML 标签
        String text = html.replaceAll("<[^>]+>", "");
        // 替换常见的 HTML 实体
        text = text.replaceAll("&nbsp;", " ")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&amp;", "&");
        // 合并多个连续空格
        return text.replaceAll("\\s+", " ").trim();
    }
}
