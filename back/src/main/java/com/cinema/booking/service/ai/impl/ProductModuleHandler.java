package com.cinema.booking.service.ai.impl;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai.impl
 * @createTime 2026-04-14  18:31
 * @description TODO
 */

import com.cinema.booking.config.ChatMemoryConfig;
import com.cinema.booking.dto.AiChatResponse;
import com.cinema.booking.dto.AiChatResponseDTO;
import com.cinema.booking.dto.CommonCardDTO;
import com.cinema.booking.ienum.AiModuleEnum;
import com.cinema.booking.model.entity.AiChatRequest;
import com.cinema.booking.service.ai.AiModuleHandler;
import com.cinema.booking.service.ai.VillageAiAssistant;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductModuleHandler implements AiModuleHandler {

    // 你原有依赖
    private final ChatModel chatModel;
    private final EmbeddingStore embeddingStore;
    private final ChatMemoryConfig chatMemoryConfig;
    private final ObjectMapper objectMapper;

    @Override
    public AiModuleEnum getModule() {
        return AiModuleEnum.PRODUCT;
    }

    @Override
    public AiChatResponse handle(AiChatRequest request) {
        try {
            // 1. 会话记忆（多轮对话）
            var chatMemory = chatMemoryConfig.createChatMemory(request.getSessionId());

            // 2. RAG 检索商品
            var retriever = EmbeddingStoreContentRetriever.builder()
                    .embeddingStore(embeddingStore)
                    .maxResults(5)
                    .build();

            // 3. 调用你原有 AI 服务
            VillageAiAssistant assistant = dev.langchain4j.service.AiServices.builder(VillageAiAssistant.class)
                    .chatModel(chatModel)
                    .chatMemory(chatMemory)
                    .contentRetriever(retriever)
                    .build();

            String jsonResult = assistant.answer(request.getMessage());
            log.info("【特产模块】返回JSON：{}", jsonResult);

            // 4. 解析为统一响应体
//            AiChatResponse response = objectMapper.readValue(jsonResult, AiChatResponse.class);
//            log.info("商品info：{}",response);
//            response.setModuleType(getModule().name());
//            return response;

            // 2. 核心修复：直接反序列化（AI已返回cardList，无需手动转换）
            // 第一步：先反序列化到AiChatResponse（此时cardList已有数据）
            AiChatResponse response = objectMapper.readValue(jsonResult, AiChatResponse.class);

            // 第二步：补充会话信息（AI返回的JSON里没有sessionId/userId）
            response.setSessionId(request.getSessionId());
            response.setUserId(request.getUserId());
            response.setModuleType(getModule().name());

            log.info("商品info：{}", response); // 此时cardList会有数据
            return response;

        } catch (Exception e) {
//            log.error("特产模块异常", e);
//            return AiChatResponse.builder()
//                    .moduleType(getModule().name())
//                    .recommendText("抱歉，商品推荐服务暂时异常~")
//                    .build();
            log.error("特产模块异常", e);
            // 兜底返回：补充sessionId/userId，cardList为空列表
            return AiChatResponse.builder()
                    .sessionId(request.getSessionId())
                    .userId(request.getUserId())
                    .moduleType(getModule().name())
                    .recommendText("抱歉，商品推荐服务暂时异常~")
                    .cardList(new ArrayList<>()) // 避免null
                    .build();
        }
    }
}
