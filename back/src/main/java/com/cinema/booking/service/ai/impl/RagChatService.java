package com.cinema.booking.service.ai.impl;

import com.cinema.booking.config.ChatMemoryConfig;
import com.cinema.booking.dto.AiChatProductDTO;
import com.cinema.booking.dto.AiChatResponseDTO;
import com.cinema.booking.service.ai.VillageAiAssistant;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
@Slf4j
public class RagChatService {

    private final ChatModel chatModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final ChatMemoryConfig chatMemoryConfig;
    private final ObjectMapper objectMapper;

    // 🔥 返回值改为 AiChatResponseDTO
    public AiChatResponseDTO chat(String sessionId, String message) {
        try {
            // 1. Redis持久化会话（不变）
            ChatMemory chatMemory = chatMemoryConfig.createChatMemory(sessionId);

            // 2. RAG检索5个商品（不变）
            EmbeddingStoreContentRetriever retriever = EmbeddingStoreContentRetriever.builder()
                    .embeddingStore(embeddingStore)
                    .maxResults(5)
                    .build();

            // 3. 官网标准写法（不变）
            VillageAiAssistant assistant = AiServices.builder(VillageAiAssistant.class)
                    .chatModel(chatModel)
                    .chatMemory(chatMemory)
                    .contentRetriever(retriever)
                    .build();

            // 4. 解析AI返回的JSON为结构化对象
            String json = assistant.answer(message);
            log.info("解析的json返回数据：{}",json);

            // ✅ 映射给外层DTO，而不是单个商品！
            return objectMapper.readValue(json, AiChatResponseDTO.class);

        } catch (Exception e) {
            throw new RuntimeException("AI对话服务异常", e);
        }
    }
}
