package com.cinema.booking.controller;

import com.cinema.booking.dto.AiChatResponse;
import com.cinema.booking.dto.CommonCardDTO;
import com.cinema.booking.service.ai.RuralDigitalAgent;

import com.cinema.booking.utils.Result;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
//    private final AiRouterService aiRouterService;
    private final RuralDigitalAgent ruralDigitalAgent;
    private final ObjectMapper objectMapper;

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
        log.info("【AI对话请求】用户ID：{}，内容：{}", userId, userMessage);

        try {
            // 1. 调用AI Agent（自动携带上下文、自动调用工具）
            String aiJson = ruralDigitalAgent.chat(String.valueOf(userId), userMessage);
            log.info("【AI返回原始JSON】：{}", aiJson);

            // 2. 解析AI返回的JSON（提取文本 + 卡片列表）
            Map<String, Object> aiResult = objectMapper.readValue(aiJson, new TypeReference<>() {});
            String recommendText = (String) aiResult.get("recommendText");
            // 读取 AI 返回的 productList（日志里的真实字段）
            // ===================== 核心修复：自动识别所有列表类型 =====================
            List<CommonCardDTO> commonCardDTOS = parseAiResult(aiResult);
            // 3. 组装【你原有项目标准返回体】AiChatResponse
            AiChatResponse response = AiChatResponse.builder()
                    .sessionId(String.valueOf(userId))   // 会话ID = 用户ID（多轮对话唯一标识）
                    .userId(userId)                     // 用户ID
                    .recommendText(recommendText)       // AI推荐文本
                    .moduleType("AUTO")                 // Agent自动识别模块（PRODUCT/SCENIC/NEWS）
                    .cardList(commonCardDTOS)                 // 结构化卡片
                    .build();

            // 4. 返回项目统一成功格式
            return Result.success(response);

        } catch (Exception e) {
            log.error("【AI对话异常】", e);
            // 5. 异常兜底（完全兼容前端格式）
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
            card.setContent(desc);

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
}
