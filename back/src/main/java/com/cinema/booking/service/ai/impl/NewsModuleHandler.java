package com.cinema.booking.service.ai.impl;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai.impl
 * @createTime 2026-04-14  18:39
 * @description TODO
 */

import com.cinema.booking.config.ChatMemoryConfig;
import com.cinema.booking.dto.AiChatResponse;
import com.cinema.booking.ienum.AiModuleEnum;
import com.cinema.booking.model.entity.AiChatRequest;
import com.cinema.booking.service.ai.AiModuleHandler;
import com.cinema.booking.service.ai.NewsAiAssistant;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsModuleHandler implements AiModuleHandler {

    private final ChatModel chatModel;
    private final EmbeddingStore newsEmbeddingStore;
    private final ChatMemoryConfig chatMemoryConfig;
    private final ObjectMapper objectMapper;

    @Override
    public AiModuleEnum getModule() {
        return AiModuleEnum.NEWS;
    }

    @Override
    public AiChatResponse handle(AiChatRequest request) {
        try {
            var chatMemory = chatMemoryConfig.createChatMemory(request.getSessionId());
            var retriever = EmbeddingStoreContentRetriever.builder()
                    .embeddingStore(newsEmbeddingStore)
                    .maxResults(3)
                    .build();

            NewsAiAssistant assistant = dev.langchain4j.service.AiServices.builder(NewsAiAssistant.class)
                    .chatModel(chatModel)
                    .chatMemory(chatMemory)
                    .contentRetriever(retriever)
                    .build();

            String jsonResult = assistant.answer(request.getMessage());
            log.info("【资讯模块】返回JSON：{}", jsonResult);

            AiChatResponse response = objectMapper.readValue(jsonResult, AiChatResponse.class);
            response.setModuleType(getModule().name());
            return response;

        } catch (Exception e) {
            log.error("资讯模块异常", e);
            return AiChatResponse.builder()
                    .moduleType(getModule().name())
                    .recommendText("抱歉，资讯服务暂时异常~")
                    .build();
        }
    }
}
