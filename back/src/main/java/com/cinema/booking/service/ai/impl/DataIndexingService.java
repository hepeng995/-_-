package com.cinema.booking.service.ai.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
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
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataIndexingService implements CommandLineRunner {

    private final ProductMapper productMapper;
    private final AttractionMapper attractionMapper;
    private final NewsMapper newsMapper;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;
    private final LuceneBM25Manager luceneBM25Manager;

    @Override
    public void run(String... args) {
        log.info("【数据索引】开始构建向量索引和 BM25 索引...");
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

        // 4. 存入 Qdrant 向量库
        embeddingStore.addAll(embeddingModel.embedAll(textSegments).content(), textSegments);

        // 5. 存入 Lucene 关键词检索库
        luceneBM25Manager.buildIndex(luceneDocs);
    }
}
