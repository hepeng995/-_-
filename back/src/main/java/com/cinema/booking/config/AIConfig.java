package com.cinema.booking.config;

import com.cinema.booking.mapper.AttractionMapper;
import com.cinema.booking.mapper.NewsMapper;
import com.cinema.booking.mapper.ProductMapper;
import com.cinema.booking.mapper.ProductReviewMapper;
import com.cinema.booking.service.ai.RuralDigitalAgent;
import com.cinema.booking.service.ai.impl.HybridRetrievalService;
import com.cinema.booking.service.ai.impl.RuralDigitalTools;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.community.model.dashscope.QwenEmbeddingModel;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@AllArgsConstructor
public class AIConfig {

    /**
     * 旧版本知识库曾使用 512 维 BGE 向量。
     * 这里显式切换到新的集合名，避免与当前 text-embedding-v3 的 1024 维向量混用。
     */
    public static final String KNOWLEDGE_COLLECTION = "village_knowledge_base_qwen_v3_1024";
    public static final long KNOWLEDGE_VECTOR_SIZE = 1024L;

    // 注入你原有的会话配置
    private final ChatMemoryConfig chatMemoryConfig;

    /**
     *
     */
    /**
     * 配置入模型
     */
    @Bean
    public EmbeddingModel embeddingModel() {
        return QwenEmbeddingModel.builder()
                .apiKey("sk-67eae102ebec4dc99464ef08e40635bd")
                .modelName("text-embedding-v3") // 通义向量v3
                .build();

//        return new BgeSmallZhV15EmbeddingModel();
    }

    /**
     * 配置 Qdrant 客户端。
     * 第四个布尔参数关闭版本兼容检查，避免 1.13 客户端对 1.17 服务端持续告警。
     */
    @Bean
    public QdrantClient qdrantClient() {
        return new QdrantClient(
                QdrantGrpcClient.newBuilder("localhost", 6334, false, false).build()
        );
    }

    /**
     * 配置向量存储
     */
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore(QdrantClient qdrantClient) {
        return QdrantEmbeddingStore.builder()
                .client(qdrantClient)
                .collectionName(KNOWLEDGE_COLLECTION)
                .build();
    }

    // ===================== 2. 核心：注入 RuralDigitalTools =====================
    // 这里就是你缺少的关键！手动创建Tools，交给Spring管理
    @Bean
    public RuralDigitalTools ruralDigitalTools(
            HybridRetrievalService hybridRetrievalService,
            AttractionMapper attractionMapper,
            NewsMapper newsMapper,
            ProductMapper productMapper,
            ProductReviewMapper productReviewMapper,
            ObjectMapper objectMapper) {
        return new RuralDigitalTools(
                hybridRetrievalService,
                attractionMapper,
                newsMapper,
                productMapper,
                productReviewMapper,
                objectMapper
        );
    }


    // ===================== 4. 创建 AI Agent 实例 =====================
    // 3. AI Agent（核心：对接你的上下文）
    @Bean
    public RuralDigitalAgent ruralDigitalAgent(
            ChatModel chatLanguageModel,
            RuralDigitalTools tools) {

        return AiServices.builder(RuralDigitalAgent.class)
                .chatModel(chatLanguageModel)
                .tools(tools)
                // 关键：用你自己的createChatMemory，支持多用户隔离
                .chatMemoryProvider(memoryId -> chatMemoryConfig.createChatMemory((String) memoryId))
                .build();
    }

}
