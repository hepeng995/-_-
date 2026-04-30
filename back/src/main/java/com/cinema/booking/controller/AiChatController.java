package com.cinema.booking.controller;

import com.cinema.booking.config.AiConfigurationGuard;
import com.cinema.booking.dto.AiChatResponse;
import com.cinema.booking.dto.CommonCardDTO;
import com.cinema.booking.service.ai.RuralDigitalAgent;
import com.cinema.booking.service.ai.impl.RuralDigitalTools;
import com.cinema.booking.utils.Result;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * AI智能对话统一接口（四大模块：商品/景点/资讯/建言）
 */
@RestController
@RequestMapping("/ai") // 统一接口前缀，符合REST规范
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI对话接口", description = "会话式AI智能助手（商品/景点/资讯/建言）")
public class AiChatController {

    // 注入你已完成的路由服务（核心：分发到四大模块）
    private final RuralDigitalAgent ruralDigitalAgent;
    private final RuralDigitalTools ruralDigitalTools;
    private final ObjectMapper objectMapper;
    private final AiConfigurationGuard aiConfigurationGuard;

    /**
     * AI 对话主接口（完全兼容你旧接口的返回格式）
     * @param userId 请求头用户ID（Long类型）
     * @param userMessage 用户提问
     * @return Result<AiChatResponse> 项目标准返回
     */
    @PostMapping("/chat")
    public Result<AiChatResponse> chat(
            @RequestHeader("userId") Long userId,
            @RequestBody String userMessage
    ) {
        String normalizedMessage = normalizeUserMessage(userMessage);
        log.info("【AI对话请求】用户ID：{}，原始内容：{}，规范化后：{}", userId, userMessage, normalizedMessage);

        try {
            // 1. 对确定性推荐类问题直接走本地工具，避免大模型工具调用不稳定导致空卡片
            String aiJson = routeByTool(normalizedMessage);
            if (aiJson == null) {
                aiJson = ruralDigitalAgent.chat(String.valueOf(userId), normalizedMessage);
            }
            log.info("【AI返回原始JSON】：{}", aiJson);

            // 2. 预清理 LLM 可能包裹的 Markdown 代码块标记
            aiJson = stripMarkdownCodeBlock(aiJson);

            // 3. 解析AI返回的JSON（提取文本 + 卡片列表）
            Map<String, Object> aiResult = objectMapper.readValue(aiJson, new TypeReference<>() {});
            String recommendText = stripMarkdownCodeBlock((String) aiResult.get("recommendText"));
            // 读取 AI 返回的 productList（日志里的真实字段）
            // ===================== 核心修复：自动识别所有列表类型 =====================
            List<CommonCardDTO> commonCardDTOS = parseAiResult(aiResult);
            // 4. 组装【你原有项目标准返回体】AiChatResponse
            AiChatResponse response = AiChatResponse.builder()
                    .sessionId(String.valueOf(userId))   // 会话ID = 用户ID（多轮对话唯一标识）
                    .userId(userId)                     // 用户ID
                    .recommendText(recommendText)       // AI推荐文本
                    .moduleType("AUTO")                 // Agent自动识别模块（PRODUCT/SCENIC/NEWS）
                    .cardList(commonCardDTOS)                 // 结构化卡片
                    .build();

            // 5. 返回项目统一成功格式
            return Result.success(response);

        } catch (Exception e) {
            log.error("【AI对话异常】", e);
            // 6. 异常兜底（完全兼容前端格式）
            AiChatResponse errorResponse = AiChatResponse.builder()
                    .sessionId(String.valueOf(userId))
                    .userId(userId)
                    .recommendText("抱歉，AI服务暂时异常，请稍后再试~")
                    .moduleType("ERROR")
                    .cardList(List.of())
                    .build();
            return Result.fail(500,"抱歉，AI服务暂时异常，请稍后再试~" ,errorResponse);
        }
    }

    @GetMapping("/health")
    public Result<Map<String, Object>> health() {
        return Result.ok(aiConfigurationGuard.healthStatus());
    }

    private String normalizeUserMessage(String rawMessage) {
        if (rawMessage == null) {
            return "";
        }

        String trimmed = rawMessage.trim();
        if (trimmed.isEmpty()) {
            return trimmed;
        }

        try {
            JsonNode root = objectMapper.readTree(trimmed);
            if (root.isTextual()) {
                return root.asText().trim();
            }

            JsonNode userMessageNode = root.get("userMessage");
            if (userMessageNode != null && userMessageNode.isTextual()) {
                return userMessageNode.asText().trim();
            }
        } catch (Exception ignored) {
            // 原始请求体不是 JSON 时，直接按普通文本处理
        }

        if (trimmed.length() >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            return trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }

    private String routeByTool(String message) {
        if (!StringUtils.hasText(message)) {
            return null;
        }

        if (containsAny(message, "路线", "行程", "规划", "旅游攻略", "出行")) {
            return ruralDigitalTools.retrieveRoutes(message);
        }
        if (containsAny(message, "景点", "旅游", "景区", "游玩", "一日游", "好玩的")) {
            return ruralDigitalTools.retrieveScenics(message);
        }
        if (containsAny(message, "资讯", "政策", "新闻", "动态", "公告")) {
            return ruralDigitalTools.retrieveNews(message);
        }
        if (containsAny(message, "好评", "口碑")) {
            return ruralDigitalTools.retrieveProductsWithGoodReviews(message);
        }
        if (containsAny(message, "特产", "商品", "购买", "买", "商城", "农产品", "蜂蜜", "茶叶")) {
            return ruralDigitalTools.retrieveProducts(message);
        }
        return null;
    }

    private boolean containsAny(String text, String... keywords) {
        if (!StringUtils.hasText(text)) {
            return false;
        }
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 万能解析AI返回结果
     * 自动适配：productList/scenicList/newsList
     * 自动适配：productName/scenicName/title | description/content | price/extra
     */
    private List<CommonCardDTO> parseAiResult(Map<String, Object> aiResult) {
        List<CommonCardDTO> cardList = new ArrayList<>();
        List<Map<String, Object>> dataList = new ArrayList<>();

        // 1. 自动识别所有列表类型（空安全）
        if (aiResult.get("productList") != null) {
            dataList = (List<Map<String, Object>>) aiResult.get("productList");
        } else if (aiResult.get("scenicList") != null) {
            dataList = (List<Map<String, Object>>) aiResult.get("scenicList");
        } else if (aiResult.get("newsList") != null) {
            dataList = (List<Map<String, Object>>) aiResult.get("newsList");
        } else if (aiResult.get("cardList") != null) {
            dataList = (List<Map<String, Object>>) aiResult.get("cardList");
        }

        // 2. 自动适配所有动态字段名（核心逻辑）
        for (Map<String, Object> item : dataList) {
            CommonCardDTO card = new CommonCardDTO();

            // 适配ID
            card.setId(item.get("id") != null ? Long.valueOf(item.get("id").toString()) : null);

            // 适配名称：productName(商品) / scenicName(景点) / title(资讯)
            String name = (String) (item.get("productName") != null ? item.get("productName") :
                    item.get("scenicName") != null ? item.get("scenicName") :
                            item.get("title") != null ? item.get("title") : "未知名称");
            card.setTitle(name);

            // 适配描述：description / content
            String desc = (String) (item.get("description") != null ? item.get("description") :
                    item.get("content") != null ? item.get("content") : "暂无描述");
            card.setContent(truncateAndClean(desc));

            // 适配价格/额外信息：price / extra
            String price = (String) (item.get("price") != null ? item.get("price") :
                    item.get("extra") != null ? item.get("extra") : "");
            card.setExtra(price);

            card.setImages((String) item.get("images"));

            // 适配详情链接
            card.setDetailUrl((String) item.get("detailUrl"));

            cardList.add(card);
        }
        return cardList;
    }

    private String stripMarkdownCodeBlock(String text) {
        if (text == null || text.isBlank()) {
            return text;
        }
        String cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```[a-zA-Z]*\\s*", "");
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.trim();
        }
        return cleaned;
    }

    private String truncateAndClean(String text) {
        if (text == null || text.isBlank()) {
            return "暂无描述";
        }
        String clean = text.replaceAll("<[^>]+>", "")
                .replaceAll("```[a-zA-Z]*\\s*", "")
                .replaceAll("```", "")
                .replaceAll("\\*\\*", "")
                .replaceAll("\\s+", " ")
                .trim();
        if (clean.length() > 80) {
            clean = clean.substring(0, 80) + "...";
        }
        return clean;
    }
}
