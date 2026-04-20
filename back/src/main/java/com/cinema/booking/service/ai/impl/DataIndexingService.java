package com.cinema.booking.service.ai.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cinema.booking.config.AiVectorProperties;
import com.cinema.booking.entity.Attraction;
import com.cinema.booking.entity.News;
import com.cinema.booking.entity.Product;
import com.cinema.booking.mapper.AttractionMapper;
import com.cinema.booking.mapper.NewsMapper;
import com.cinema.booking.mapper.ProductMapper;
import com.cinema.booking.utils.LuceneBM25Manager;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.Content;
import dev.langchain4j.store.embedding.EmbeddingStore;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.grpc.Collections;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataIndexingService implements CommandLineRunner {

    private final ProductMapper productMapper;
    private final AttractionMapper attractionMapper;
    private final NewsMapper newsMapper;
    private final QdrantClient qdrantClient;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;
    private final LuceneBM25Manager luceneBM25Manager;
    private final AiVectorProperties aiVectorProperties;
    private final QdrantVectorSearchAdapter qdrantVectorSearchAdapter;

    @Override
    public void run(String... args) {
        log.info("【数据索引】开始构建向量索引和 BM25 索引，Qdrant={} HTTP:{} gRPC:{}，目标集合={}",
                aiVectorProperties.getQdrantHost(),
                aiVectorProperties.getQdrantHttpPort(),
                aiVectorProperties.getQdrantGrpcPort(),
                aiVectorProperties.getKnowledgeCollection());
        indexAllData();
        log.info("【数据索引】构建完成！");
    }

    public void indexAllData() {
        List<LuceneBM25Manager.LuceneDocument> luceneDocs = new ArrayList<>();
        List<TextSegment> textSegments = new ArrayList<>();

        // 1. 索引商品
        List<Product> products = productMapper.selectList(
                new LambdaQueryWrapper<Product>().eq(Product::getDeleted, 0).eq(Product::getStatus, 1)
        );
        for (Product p : products) {
            String text = String.format("【特产商城】商品名称：%s。商品描述：%s。价格：%s元。产地：%s。评分：%.1f分。",
                    p.getName(), p.getDescription(), p.getPrice(), p.getOrigin(), p.getRating());

            Map<String, Object> metaMap = new HashMap<>();
            metaMap.put("type", "PRODUCT");
            metaMap.put("id", String.valueOf(p.getId()));
            metaMap.put("name", p.getName());
            metaMap.put("images", p.getImages()); // 新增：商品图片地址

            Metadata metadata = Metadata.from(metaMap);
            TextSegment segment = TextSegment.from(text, metadata);
            textSegments.add(segment);
            luceneDocs.add(new LuceneBM25Manager.LuceneDocument(String.valueOf(p.getId()), "PRODUCT", text));
        }

        // 2. 索引景点
        List<Attraction> attractions = attractionMapper.selectList(
                new LambdaQueryWrapper<Attraction>().eq(Attraction::getDeleted, 0).eq(Attraction::getStatus, 1)
        );
        for (Attraction a : attractions) {
            String text = String.format("【旅游景点】景点名称：%s。景点介绍：%s。地址：%s。门票价格：%s元。评分：%.1f分。",
                    a.getName(), a.getDescription(), a.getAddress(), a.getTicketPrice(), a.getRating());

            Map<String, Object> metaMap = new HashMap<>();
            metaMap.put("type", "SCENIC");
            metaMap.put("id", String.valueOf(a.getId()));
            metaMap.put("name", a.getName());
            metaMap.put("images", a.getImages()); // 新增：景点图片地址

            Metadata metadata = Metadata.from(metaMap);
            TextSegment segment = TextSegment.from(text, metadata);
            textSegments.add(segment);
            luceneDocs.add(new LuceneBM25Manager.LuceneDocument(String.valueOf(a.getId()), "SCENIC", text));
        }

        // 3. 索引资讯
        List<News> newsList = newsMapper.selectList(
                new LambdaQueryWrapper<News>().eq(News::getDeleted, 0).eq(News::getStatus, 1)
        );
        for (News n : newsList) {
            String content = n.getContent() != null && n.getContent().length() > 500
                    ? n.getContent().substring(0, 500) : n.getContent();
            String text = String.format("【乡村资讯】资讯标题：%s。摘要：%s。内容：%s。分类：%s。",
                    n.getTitle(), n.getSummary(), content, n.getCategory());

            Map<String, Object> metaMap = new HashMap<>();
            metaMap.put("type", "NEWS");
            metaMap.put("id", String.valueOf(n.getId()));
            metaMap.put("name", n.getTitle());

            Metadata metadata = Metadata.from(metaMap);
            TextSegment segment = TextSegment.from(text, metadata);
            textSegments.add(segment);
            luceneDocs.add(new LuceneBM25Manager.LuceneDocument(String.valueOf(n.getId()), "NEWS", text));
        }

        // 4. 先构建 BM25，保证向量库异常时仍可检索
        luceneBM25Manager.buildIndex(luceneDocs);

        // 5. 再写入向量库。每次启动都重建知识库集合，避免旧维度和历史重复数据污染。
        if (textSegments.isEmpty()) {
            log.warn("【数据索引】未发现可写入的知识片段，跳过向量索引构建");
            qdrantVectorSearchAdapter.disableVectorSearch("当前没有可建立向量索引的知识片段");
            return;
        }

        try {
            recreateKnowledgeCollection();
            embeddingStore.addAll(embeddingModel.embedAll(textSegments).content(), textSegments);
            log.info("【数据索引】向量索引构建完成，共写入 {} 条文档", textSegments.size());
            runVectorSmokeTest();
            cleanupLegacyCollections();
        } catch (Exception e) {
            String reason = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
            qdrantVectorSearchAdapter.disableVectorSearch(reason);
            log.warn("【数据索引】向量索引构建或烟测失败，向量检索已禁用，系统将自动降级为 BM25 检索", e);
        }
    }

    private void recreateKnowledgeCollection() throws Exception {
        Collections.VectorParams vectorParams = Collections.VectorParams.newBuilder()
                .setSize(aiVectorProperties.getKnowledgeVectorSize())
                .setDistance(Collections.Distance.Cosine)
                .build();

        boolean exists = qdrantClient.collectionExistsAsync(aiVectorProperties.getKnowledgeCollection())
                .get(15, TimeUnit.SECONDS);
        if (exists) {
            qdrantClient.deleteCollectionAsync(aiVectorProperties.getKnowledgeCollection())
                    .get(15, TimeUnit.SECONDS);
            log.info("【数据索引】已删除旧的 Qdrant 集合：{}", aiVectorProperties.getKnowledgeCollection());
        }

        qdrantClient.createCollectionAsync(aiVectorProperties.getKnowledgeCollection(), vectorParams)
                .get(15, TimeUnit.SECONDS);

        log.info("【数据索引】Qdrant 集合已重建：{}，维度：{}，距离：{}",
                aiVectorProperties.getKnowledgeCollection(),
                aiVectorProperties.getKnowledgeVectorSize(),
                Collections.Distance.Cosine);
    }

    private void runVectorSmokeTest() throws Exception {
        boolean collectionExists = qdrantClient.collectionExistsAsync(aiVectorProperties.getKnowledgeCollection())
                .get(15, TimeUnit.SECONDS);
        if (!collectionExists) {
            throw new IllegalStateException("Qdrant 集合重建后不可见");
        }

        long pointCount = qdrantClient.countAsync(aiVectorProperties.getKnowledgeCollection())
                .get(15, TimeUnit.SECONDS);
        if (pointCount <= 0) {
            throw new IllegalStateException("Qdrant 集合中没有任何点位");
        }

        int queryDimension = qdrantVectorSearchAdapter.getQueryVectorDimension(aiVectorProperties.getSmokeTestQuery());
        if (queryDimension != aiVectorProperties.getKnowledgeVectorSize()) {
            throw new IllegalStateException(String.format(
                    "烟测查询向量维度异常，期望=%d，实际=%d",
                    aiVectorProperties.getKnowledgeVectorSize(),
                    queryDimension
            ));
        }

        List<Content> productResults = qdrantVectorSearchAdapter.search(aiVectorProperties.getSmokeTestQuery(), "PRODUCT", 3);
        if (productResults.isEmpty()) {
            throw new IllegalStateException("向量烟测未召回任何 PRODUCT 内容");
        }

        qdrantVectorSearchAdapter.enableVectorSearch();
        log.info("【数据索引】向量烟测通过，集合：{}，点位：{}，查询维度：{}，PRODUCT召回：{}",
                aiVectorProperties.getKnowledgeCollection(),
                pointCount,
                queryDimension,
                productResults.size());
    }

    private void cleanupLegacyCollections() {
        for (String legacyCollection : aiVectorProperties.getLegacyCollections()) {
            if (legacyCollection == null || legacyCollection.isBlank()) {
                continue;
            }
            if (legacyCollection.equals(aiVectorProperties.getKnowledgeCollection())) {
                continue;
            }

            try {
                boolean exists = qdrantClient.collectionExistsAsync(legacyCollection)
                        .get(15, TimeUnit.SECONDS);
                if (exists) {
                    qdrantClient.deleteCollectionAsync(legacyCollection)
                            .get(15, TimeUnit.SECONDS);
                    log.info("【数据索引】已清理遗留 Qdrant 集合：{}", legacyCollection);
                }
            } catch (Exception e) {
                log.warn("【数据索引】清理遗留集合失败：{}", legacyCollection, e);
            }
        }
    }
}
