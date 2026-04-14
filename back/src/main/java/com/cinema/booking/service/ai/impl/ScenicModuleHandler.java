package com.cinema.booking.service.ai.impl;

import com.cinema.booking.config.ChatMemoryConfig;
import com.cinema.booking.dto.AiChatResponse;
import com.cinema.booking.ienum.AiModuleEnum;
import com.cinema.booking.model.entity.AiChatRequest;
import com.cinema.booking.service.ai.AiModuleHandler;
import com.cinema.booking.service.ai.ScenicAiAssistant;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai.impl
 * @createTime 2026-04-14  18:36
 * @description TODO
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScenicModuleHandler implements AiModuleHandler {

    private final ChatModel chatModel;
    private final EmbeddingStore scenicEmbeddingStore;
    private final ChatMemoryConfig chatMemoryConfig;
    private final ObjectMapper objectMapper;

    @Override
    public AiModuleEnum getModule() {
        return AiModuleEnum.SCENIC;
    }

    @Override
    public AiChatResponse handle(AiChatRequest request) {
        try {
            var chatMemory = chatMemoryConfig.createChatMemory(request.getSessionId());
            var retriever = EmbeddingStoreContentRetriever.builder()
                    .embeddingStore(scenicEmbeddingStore)
                    .maxResults(5)
                    .build();

            ScenicAiAssistant assistant = dev.langchain4j.service.AiServices.builder(ScenicAiAssistant.class)
                    .chatModel(chatModel)
                    .chatMemory(chatMemory)
                    .contentRetriever(retriever)
                    .build();

            String jsonResult = assistant.answer(request.getMessage());
            log.info("【景点模块】返回JSON：{}", jsonResult);

            AiChatResponse response = objectMapper.readValue(jsonResult, AiChatResponse.class);
            response.setModuleType(getModule().name());
            return response;

        } catch (Exception e) {
            log.error("景点模块异常", e);
            return AiChatResponse.builder()
                    .moduleType(getModule().name())
                    .recommendText("抱歉，景点导览服务暂时异常~")
                    .build();
        }
    }
}
