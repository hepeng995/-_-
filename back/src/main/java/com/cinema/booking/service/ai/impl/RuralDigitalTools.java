package com.cinema.booking.service.ai.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cinema.booking.entity.Product;
import com.cinema.booking.entity.ProductReview;
import com.cinema.booking.entity.ProductWithReviewStats;
import com.cinema.booking.mapper.ProductMapper;
import com.cinema.booking.mapper.ProductReviewMapper;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.rag.content.Content;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RuralDigitalTools {

    private final HybridRetrievalService hybridRetrievalService;
    private final ProductMapper productMapper;
    private final ProductReviewMapper productReviewMapper;

    @Tool("用于检索桃源县的特色商品信息，输入用户的商品需求，返回最相关的商品")
    public String retrieveProducts(@P("用户的商品需求，比如‘我想购买蜂蜜’") String userQuestion) {
        log.info("【Tool-商品检索】被调用，用户问题：{}", userQuestion);
        List<Content> results = hybridRetrievalService.threeStageHybridRetrieval(userQuestion, "PRODUCT");
        return formatResults(results);
    }

    @Tool("用于检索桃源县的旅游景点信息，输入用户的景点需求，返回最相关的景点")
    public String retrieveScenics(@P("用户的景点需求，比如‘我想去桃花源玩’") String userQuestion) {
        log.info("【Tool-景点检索】被调用，用户问题：{}", userQuestion);
        List<Content> results = hybridRetrievalService.threeStageHybridRetrieval(userQuestion, "SCENIC");
        return formatResults(results);
    }

    @Tool("用于检索桃源县的乡村资讯和政策信息，输入用户的资讯需求，返回最相关的资讯")
    public String retrieveNews(@P("用户的资讯需求，比如‘最新的乡村振兴政策’") String userQuestion) {
        log.info("【Tool-资讯检索】被调用，用户问题：{}", userQuestion);
        List<Content> results = hybridRetrievalService.threeStageHybridRetrieval(userQuestion, "NEWS");
        return formatResults(results);
    }

    @Tool("用于查询好评多、口碑好的商品，输入商品类型或名称，返回评论最好的商品")
    public String retrieveProductsWithGoodReviews(@P("用户的商品需求，比如‘蜂蜜’、‘茶叶’") String keyword) {
        log.info("【Tool-好评商品查询】被调用，关键词：{}", keyword);

        List<ProductWithReviewStats> products = productMapper.selectProductsWithGoodReviews(keyword);

        if (products == null || products.isEmpty()) {
            return "暂无符合条件的好评商品";
        }

        return products.stream()
                .map(p -> String.format("""
                        【商品名称】%s
                        【价格】%s元
                        【产地】%s
                        【平均评分】%.1f分
                        【评价总数】%d条
                        【好评数】%d条
                        【精选好评】%s
                        """,
                        p.getName(),
                        p.getPrice(),
                        p.getOrigin(),
                        p.getAvgRating(),
                        p.getReviewCount(),
                        p.getGoodReviewCount(),
                        p.getTopReview()
                ))
                .collect(Collectors.joining("\n---\n"));
    }

    @Tool("用于查看某款商品的具体用户评论，输入商品名称，返回最新的10条评论")
    public String retrieveProductReviews(@P("商品名称，比如‘桃源蜂蜜’") String productName) {
        log.info("【Tool-商品评论查询】被调用，商品名称：{}", productName);

        Product product = productMapper.selectOne(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getName, productName)
                        .eq(Product::getDeleted, 0)
                        .last("LIMIT 1")
        );

        if (product == null) {
            return "未找到商品：" + productName;
        }

        List<ProductReview> reviews = productReviewMapper.selectList(
                new LambdaQueryWrapper<ProductReview>()
                        .eq(ProductReview::getProductId, product.getId())
                        .eq(ProductReview::getStatus, 1)
                        .eq(ProductReview::getDeleted, 0)
                        .orderByDesc(ProductReview::getCreatedAt)
                        .last("LIMIT 10")
        );

        if (reviews == null || reviews.isEmpty()) {
            return "商品【" + productName + "】暂无用户评论";
        }

        return String.format("【商品】%s\n\n【最新评论】\n%s",
                productName,
                reviews.stream()
                        .map(r -> String.format("- [%d星] %s", r.getRating(), r.getContent()))
                        .collect(Collectors.joining("\n"))
        );
    }

    private String formatResults(List<Content> contents) {
        return contents.stream()
                .map(c -> c.textSegment().text())
                .collect(Collectors.joining("\n---\n"));
    }
}
