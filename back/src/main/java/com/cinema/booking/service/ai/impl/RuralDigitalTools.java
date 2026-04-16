package com.cinema.booking.service.ai.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cinema.booking.dto.CommonCardDTO;
import com.cinema.booking.entity.Attraction;
import com.cinema.booking.entity.News;
import com.cinema.booking.entity.Product;
import com.cinema.booking.entity.ProductReview;
import com.cinema.booking.entity.ProductWithReviewStats;
import com.cinema.booking.mapper.AttractionMapper;
import com.cinema.booking.mapper.NewsMapper;
import com.cinema.booking.mapper.ProductMapper;
import com.cinema.booking.mapper.ProductReviewMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.rag.content.Content;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RuralDigitalTools {

    private static final int CARD_LIMIT = 3;
    private static final DateTimeFormatter NEWS_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final HybridRetrievalService hybridRetrievalService;
    private final AttractionMapper attractionMapper;
    private final NewsMapper newsMapper;
    private final ProductMapper productMapper;
    private final ProductReviewMapper productReviewMapper;
    private final ObjectMapper objectMapper;

    @Tool("用于检索桃源县的特色商品信息，输入用户的商品需求，返回最相关的商品")
    public String retrieveProducts(@P("用户的商品需求，比如‘我想购买蜂蜜’") String userQuestion) {
        log.info("【Tool-商品检索】被调用，用户问题：{}", userQuestion);
        return buildRecommendPayload("PRODUCT", userQuestion);
    }

    @Tool("用于检索桃源县的旅游景点信息，输入用户的景点需求，返回最相关的景点")
    public String retrieveScenics(@P("用户的景点需求，比如‘我想去桃花源玩’") String userQuestion) {
        log.info("【Tool-景点检索】被调用，用户问题：{}", userQuestion);
        return buildRecommendPayload("SCENIC", userQuestion);
    }

    @Tool("用于检索桃源县的乡村资讯和政策信息，输入用户的资讯需求，返回最相关的资讯")
    public String retrieveNews(@P("用户的资讯需求，比如‘最新的乡村振兴政策’") String userQuestion) {
        log.info("【Tool-资讯检索】被调用，用户问题：{}", userQuestion);
        return buildRecommendPayload("NEWS", userQuestion);
    }

    @Tool("用于查询好评多、口碑好的商品，输入商品类型或名称，返回评论最好的商品")
    public String retrieveProductsWithGoodReviews(@P("用户的商品需求，比如‘蜂蜜’、‘茶叶’") String keyword) {
        log.info("【Tool-好评商品查询】被调用，关键词：{}", keyword);

        List<ProductWithReviewStats> products = productMapper.selectProductsWithGoodReviews(normalizeKeyword(keyword));
        List<CommonCardDTO> cards = products == null ? List.of() : products.stream()
                .filter(Objects::nonNull)
                .limit(CARD_LIMIT)
                .map(this::toGoodReviewProductCard)
                .toList();

        return buildPayload(
                cards.isEmpty() ? "暂未找到符合条件的高口碑商品，您也可以换个关键词再试试。" : "根据您的需求，为您推荐以下口碑较好的桃源县商品：",
                cards
        );
    }

    @Tool("用于查看某款商品的具体用户评论，输入商品名称，返回最新的10条评论")
    public String retrieveProductReviews(@P("商品名称，比如‘桃源蜂蜜’") String productName) {
        log.info("【Tool-商品评论查询】被调用，商品名称：{}", productName);

        Product product = productMapper.selectOne(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getName, normalizeKeyword(productName))
                        .eq(Product::getDeleted, Boolean.FALSE)
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

    private String buildRecommendPayload(String type, String userQuestion) {
        List<CommonCardDTO> cards = new ArrayList<>();
        try {
            List<Content> results = hybridRetrievalService.threeStageHybridRetrieval(userQuestion, type);
            cards = loadCardsFromContents(results, type);
        } catch (Exception e) {
            log.warn("【Tool-{}检索】混合检索失败，将降级为数据库推荐", type, e);
        }

        if (cards.isEmpty()) {
            cards = fallbackCards(type, userQuestion);
        }

        return buildPayload(buildRecommendText(type, cards.isEmpty()), cards);
    }

    private List<CommonCardDTO> loadCardsFromContents(List<Content> contents, String type) {
        List<Long> ids = extractIds(contents);
        if (ids.isEmpty()) {
            return List.of();
        }

        return switch (type) {
            case "PRODUCT" -> mapByIds(productMapper.selectBatchIds(ids), Product::getId, ids, this::toProductCard);
            case "SCENIC" -> mapByIds(attractionMapper.selectBatchIds(ids), Attraction::getId, ids, this::toAttractionCard);
            case "NEWS" -> mapByIds(newsMapper.selectBatchIds(ids), News::getId, ids, this::toNewsCard);
            default -> List.of();
        };
    }

    private List<CommonCardDTO> fallbackCards(String type, String userQuestion) {
        return switch (type) {
            case "PRODUCT" -> queryProductsFallback(userQuestion).stream().map(this::toProductCard).toList();
            case "SCENIC" -> queryAttractionsFallback(userQuestion).stream().map(this::toAttractionCard).toList();
            case "NEWS" -> queryNewsFallback(userQuestion).stream().map(this::toNewsCard).toList();
            default -> List.of();
        };
    }

    private List<Product> queryProductsFallback(String userQuestion) {
        String keyword = normalizeKeyword(userQuestion);
        List<Product> matched = productMapper.selectList(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getDeleted, Boolean.FALSE)
                        .eq(Product::getStatus, 1)
                        .and(StringUtils.hasText(keyword), wrapper -> wrapper
                                .like(Product::getName, keyword)
                                .or()
                                .like(Product::getDescription, keyword)
                                .or()
                                .like(Product::getOrigin, keyword))
                        .orderByDesc(Product::getIsFeatured, Product::getAvgRating, Product::getReviewCount, Product::getSalesCount)
                        .last("LIMIT " + CARD_LIMIT)
        );
        if (!matched.isEmpty()) {
            return matched;
        }

        return productMapper.selectList(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getDeleted, Boolean.FALSE)
                        .eq(Product::getStatus, 1)
                        .orderByDesc(Product::getIsFeatured, Product::getAvgRating, Product::getReviewCount, Product::getSalesCount)
                        .last("LIMIT " + CARD_LIMIT)
        );
    }

    private List<Attraction> queryAttractionsFallback(String userQuestion) {
        String keyword = normalizeKeyword(userQuestion);
        List<Attraction> matched = attractionMapper.selectList(
                new LambdaQueryWrapper<Attraction>()
                        .eq(Attraction::getDeleted, Boolean.FALSE)
                        .eq(Attraction::getStatus, 1)
                        .and(StringUtils.hasText(keyword), wrapper -> wrapper
                                .like(Attraction::getName, keyword)
                                .or()
                                .like(Attraction::getDescription, keyword)
                                .or()
                                .like(Attraction::getAddress, keyword))
                        .orderByDesc(Attraction::getRating, Attraction::getViewCount)
                        .last("LIMIT " + CARD_LIMIT)
        );
        if (!matched.isEmpty()) {
            return matched;
        }

        return attractionMapper.selectList(
                new LambdaQueryWrapper<Attraction>()
                        .eq(Attraction::getDeleted, Boolean.FALSE)
                        .eq(Attraction::getStatus, 1)
                        .orderByDesc(Attraction::getRating, Attraction::getViewCount)
                        .last("LIMIT " + CARD_LIMIT)
        );
    }

    private List<News> queryNewsFallback(String userQuestion) {
        String keyword = normalizeKeyword(userQuestion);
        List<News> matched = newsMapper.selectList(
                new LambdaQueryWrapper<News>()
                        .eq(News::getDeleted, Boolean.FALSE)
                        .eq(News::getStatus, 1)
                        .and(StringUtils.hasText(keyword), wrapper -> wrapper
                                .like(News::getTitle, keyword)
                                .or()
                                .like(News::getSummary, keyword)
                                .or()
                                .like(News::getContent, keyword)
                                .or()
                                .like(News::getCategory, keyword))
                        .orderByDesc(News::getIsTop, News::getIsFeatured, News::getPublishTime)
                        .last("LIMIT " + CARD_LIMIT)
        );
        if (!matched.isEmpty()) {
            return matched;
        }

        return newsMapper.selectList(
                new LambdaQueryWrapper<News>()
                        .eq(News::getDeleted, Boolean.FALSE)
                        .eq(News::getStatus, 1)
                        .orderByDesc(News::getIsTop, News::getIsFeatured, News::getPublishTime)
                        .last("LIMIT " + CARD_LIMIT)
        );
    }

    private List<Long> extractIds(List<Content> contents) {
        if (contents == null || contents.isEmpty()) {
            return List.of();
        }

        Set<Long> ids = new LinkedHashSet<>();
        for (Content content : contents) {
            if (content == null || content.textSegment() == null || content.textSegment().metadata() == null) {
                continue;
            }
            String idText = content.textSegment().metadata().getString("id");
            if (!StringUtils.hasText(idText)) {
                continue;
            }
            try {
                ids.add(Long.valueOf(idText));
            } catch (NumberFormatException e) {
                log.warn("【Tool-结构化卡片】无法解析知识片段 ID：{}", idText);
            }
            if (ids.size() >= CARD_LIMIT) {
                break;
            }
        }
        return new ArrayList<>(ids);
    }

    private <T> List<CommonCardDTO> mapByIds(
            List<T> records,
            Function<T, Long> idExtractor,
            List<Long> orderedIds,
            Function<T, CommonCardDTO> converter) {

        if (records == null || records.isEmpty()) {
            return List.of();
        }

        Map<Long, T> recordMap = records.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(idExtractor, Function.identity(), (left, right) -> left, LinkedHashMap::new));

        List<CommonCardDTO> cards = new ArrayList<>();
        for (Long id : orderedIds) {
            T record = recordMap.get(id);
            if (record == null) {
                continue;
            }
            cards.add(converter.apply(record));
            if (cards.size() >= CARD_LIMIT) {
                break;
            }
        }
        return cards;
    }

    private CommonCardDTO toProductCard(Product product) {
        return CommonCardDTO.builder()
                .id(product.getId())
                .title(defaultText(product.getName(), "未命名商品"))
                .content(defaultText(product.getDescription(), "暂无商品描述"))
                .extra(String.format("价格：%s元，产地：%s，评分：%s分",
                        formatAmount(product.getPrice()),
                        defaultText(product.getOrigin(), "桃源县"),
                        formatAmount(firstNonNull(product.getAvgRating(), product.getRating()))))
                .images(firstNonBlank(product.getImages(), product.getCoverImage()))
                .detailUrl("/products/" + product.getId())
                .build();
    }

    private CommonCardDTO toAttractionCard(Attraction attraction) {
        return CommonCardDTO.builder()
                .id(attraction.getId())
                .title(defaultText(attraction.getName(), "未命名景点"))
                .content(defaultText(attraction.getDescription(), "暂无景点介绍"))
                .extra(String.format("地址：%s，门票：%s元，评分：%s分",
                        defaultText(attraction.getAddress(), "桃源县"),
                        formatAmount(attraction.getTicketPrice()),
                        formatAmount(attraction.getRating())))
                .images(firstNonBlank(attraction.getImages(), attraction.getCoverImage()))
                .detailUrl("/attractions/" + attraction.getId())
                .build();
    }

    private CommonCardDTO toNewsCard(News news) {
        return CommonCardDTO.builder()
                .id(news.getId())
                .title(defaultText(news.getTitle(), "未命名资讯"))
                .content(defaultText(firstNonBlank(news.getSummary(), truncate(news.getContent(), 100)), "暂无资讯摘要"))
                .extra(String.format("分类：%s，发布时间：%s",
                        defaultText(news.getCategory(), "乡村资讯"),
                        formatDateTime(news.getPublishTime())))
                .images(news.getCoverImage())
                .detailUrl("/news/" + news.getId())
                .build();
    }

    private CommonCardDTO toGoodReviewProductCard(ProductWithReviewStats product) {
        return CommonCardDTO.builder()
                .id(product.getId())
                .title(defaultText(product.getName(), "未命名商品"))
                .content(defaultText(firstNonBlank(product.getDescription(), product.getTopReview()), "暂无商品描述"))
                .extra(String.format("价格：%s元，产地：%s，评分：%s分",
                        formatAmount(product.getPrice()),
                        defaultText(product.getOrigin(), "桃源县"),
                        formatAmount(product.getAvgRating())))
                .detailUrl("/products/" + product.getId())
                .build();
    }

    private String buildRecommendText(String type, boolean empty) {
        if (empty) {
            return switch (type) {
                case "PRODUCT" -> "暂未检索到符合条件的特色商品，您可以换个关键词再试试。";
                case "SCENIC" -> "暂未检索到符合条件的景点，您可以换个关键词再试试。";
                case "NEWS" -> "暂未检索到符合条件的资讯，您可以换个关键词再试试。";
                default -> "暂未检索到符合条件的数据。";
            };
        }

        return switch (type) {
            case "PRODUCT" -> "根据您的需求，为您推荐以下桃源县的特色商品：";
            case "SCENIC" -> "根据您的需求，为您推荐以下桃源县的热门景点：";
            case "NEWS" -> "根据您的需求，为您推荐以下桃源县的相关资讯：";
            default -> "根据您的需求，为您推荐以下内容：";
        };
    }

    private String buildPayload(String recommendText, List<CommonCardDTO> cards) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("recommendText", recommendText);
        payload.put("cardList", cards == null ? List.of() : cards);
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.error("【Tool-结构化卡片】JSON 序列化失败", e);
            return "{\"recommendText\":\"" + recommendText + "\",\"cardList\":[]}";
        }
    }

    private String normalizeKeyword(String text) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        return text.trim()
                .replace("\"", "")
                .replace("“", "")
                .replace("”", "")
                .replace("{", " ")
                .replace("}", " ")
                .replace("[", " ")
                .replace("]", " ")
                .replace(":", " ")
                .replace("：", " ")
                .replace(",", " ")
                .replace("，", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String defaultText(String text, String defaultValue) {
        return StringUtils.hasText(text) ? text : defaultValue;
    }

    private String firstNonBlank(String first, String second) {
        return StringUtils.hasText(first) ? first : second;
    }

    private BigDecimal firstNonNull(BigDecimal first, BigDecimal second) {
        return first != null ? first : second;
    }

    private String formatAmount(BigDecimal value) {
        return value == null ? "0.00" : value.stripTrailingZeros().toPlainString();
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "未知" : NEWS_TIME_FORMATTER.format(dateTime);
    }

    private String truncate(String text, int maxLength) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...";
    }
}
