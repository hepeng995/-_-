package com.cinema.booking.config;

import com.cinema.booking.mapper.ProductMapper;
import com.cinema.booking.mapper.ProductReviewMapper;
import com.cinema.booking.service.ai.RuralDigitalAgent;
import com.cinema.booking.service.ai.impl.HybridRetrievalService;
import com.cinema.booking.service.ai.impl.RuralDigitalTools;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.bgesmallzhv15.BgeSmallZhV15EmbeddingModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@AllArgsConstructor
public class AIConfig {
    // 注入你原有的会话配置
    private final ChatMemoryConfig chatMemoryConfig;

    /**
     * 1. 配置本地向量嵌入模型 (完全免费，基于 ONNX 在 JVM 运行)
     */
    /**
     * 配置入模型
     */
    @Bean
    public EmbeddingModel embeddingModel() {
        return new BgeSmallZhV15EmbeddingModel();
    }

    /**
     * 配置  向量存储
     */
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        // 连接你已有的 Qdrant 容器（端口 6334）
        QdrantClient qdrantClient = new QdrantClient(
                QdrantGrpcClient.newBuilder("localhost", 6334, false).build()
        );


        return QdrantEmbeddingStore.builder()
                .client(qdrantClient)
                .collectionName("village_knowledge_base")
                .build();
    }

    // ===================== 2. 核心：注入 RuralDigitalTools =====================
    // 这里就是你缺少的关键！手动创建Tools，交给Spring管理
    @Bean
    public RuralDigitalTools ruralDigitalTools(
            HybridRetrievalService hybridRetrievalService,
            ProductMapper productMapper,
            ProductReviewMapper productReviewMapper) {
        return new RuralDigitalTools(hybridRetrievalService, productMapper, productReviewMapper);
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
