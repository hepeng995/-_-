package com.cinema.booking.service.ai.impl;


import com.cinema.booking.dto.ProductDTO;
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
        allDocuments.addAll(fetchProductDocs());
//        allDocuments.addAll(fetchAttractionDocs());
//        allDocuments.addAll(fetchNewsDocs());
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
    private List<Document> fetchProductDocs() {
        // 仅查询未删除 (deleted=0) 且已上架 (status=1) 的特产

        List<ProductDTO> products = productService.listProductDTO(0, 1);

        return products.stream()
                .filter(Objects::nonNull) // 过滤空对象（防止空指针）
                .map(p -> {
                    // 1. 构造富文本语义（优化：更自然的语言，提升向量检索准确性）
                    String content = String.format(
                            "【特产商城】商品名称：%s。产地：%s。商品描述：%s。价格：%s元。",
                            handleNull(p.getName()),
                            handleNull(p.getOrigin()),
                            handleNull(p.getDescription()),
                            p.getPrice() != null ? String.format("%.2f", p.getPrice()) : "暂无"
                    );

                    // 2. 【核心优化】构造 Metadata（保留所有关键信息，后续检索直接用）
                    Metadata metadata = Metadata.from("id", p.getId().toString()) // 必须：真实ID，反查MySQL
                            .put("type", "PRODUCT")               // 必须：区分商品/景点
                            .put("name", handleNull(p.getName()))  // 商品名称，检索结果直接显示
                            .put("origin", handleNull(p.getOrigin())) // 产地
                            .put("price", p.getPrice() != null ? String.valueOf(p.getPrice()) : "0.0") // 转String
                            .put("categoryId", p.getCategoryId() != null ? String.valueOf(p.getCategoryId()) : "0"); // 转String

                    // 3. 返回 Document（保留原有逻辑）
                    return Document.from(content, metadata);
                })
                .toList();
    }

    /**
     * 提取【景点导览】数据
     */
//    private List<Document> fetchAttractionDocs() {
//        List<Attraction> attractions = attractionService.list(new LambdaQueryWrapper<Attraction>()
//                .eq(Attraction::getDeleted, 0)
//                .eq(Attraction::getStatus, 1));
//
//        return attractions.stream().map(a -> {
//            String content = String.format("【景点导览】名称：%s。地址：%s。介绍：%s",
//                    a.getName(),
//                    handleNull(a.getAddress()),
//                    handleNull(a.getDescription()));
//
//            Metadata metadata = Metadata.from("id", a.getId().toString())
//                    .add("type", "ATTRACTION");
//
//            return Document.from(content, metadata);
//        }).toList();
//    }

    /**
     * 提取【动态资讯】数据 (包含 HTML 清洗逻辑)
     */
//    private List<Document> fetchNewsDocs() {
//        List<News> newsList = newsService.list(new LambdaQueryWrapper<News>()
//                .eq(News::getDeleted, 0)
//                .eq(News::getStatus, 1));
//
//        return newsList.stream().map(n -> {
//            // 务必清洗掉正文里的 HTML 标签，否则会严重破坏向量匹配的精确度
//            String cleanContent = stripHtmlTags(n.getContent());
//
//            String content = String.format("【乡村资讯】标题：%s。摘要：%s。正文：%s",
//                    n.getTitle(),
//                    handleNull(n.getSummary()),
//                    cleanContent);
//
//            Metadata metadata = Metadata.from("id", n.getId().toString())
//                    .add("type", "NEWS");
//
//            return Document.from(content, metadata);
//        }).toList();
//    }

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
