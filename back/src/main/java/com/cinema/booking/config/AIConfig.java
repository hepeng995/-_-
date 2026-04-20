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
import dev.langchain4j.http.client.jdk.JdkHttpClientBuilder;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@RequiredArgsConstructor
public class AIConfig {

    // 注入你原有的会话配置
    private final ChatMemoryConfig chatMemoryConfig;
    private final AiVectorProperties aiVectorProperties;

    @Value("${langchain4j.open-ai.chat-model.api-key}")
    private String dashscopeApiKey;

    @Value("${langchain4j.open-ai.chat-model.model-name:qwen}")
    private String chatModelName;

    @Value("${langchain4j.open-ai.chat-model.base-url:https://dashscope.aliyuncs.com/compatible-mode/v1}")
    private String chatBaseUrl;

    @Value("${langchain4j.open-ai.chat-model.temperature:0.7}")
    private Double chatTemperature;

    @Value("${langchain4j.open-ai.chat-model.max-tokens:3092}")
    private Integer chatMaxTokens;

    @Value("${langchain4j.open-ai.chat-model.timeout:PT60S}")
    private Duration chatTimeout;

    @Value("${langchain4j.open-ai.chat-model.max-retries:1}")
    private Integer chatMaxRetries;

    @Value("${langchain4j.open-ai.chat-model.log-requests:false}")
    private Boolean chatLogRequests;

    @Value("${langchain4j.open-ai.chat-model.log-responses:false}")
    private Boolean chatLogResponses;

    /**
     *
     */
    /**
     * 配置入模型
     */
    @Bean
    public EmbeddingModel embeddingModel() {
        return QwenEmbeddingModel.builder()
                .apiKey(dashscopeApiKey)
                .modelName(aiVectorProperties.getEmbeddingModelName())
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
                QdrantGrpcClient.newBuilder(
                        aiVectorProperties.getQdrantHost(),
                        aiVectorProperties.getQdrantGrpcPort(),
                        false,
                        false
                ).build()
        );
    }

    /**
     * 配置向量存储
     */
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore(QdrantClient qdrantClient) {
        return QdrantEmbeddingStore.builder()
                .client(qdrantClient)
                .collectionName(aiVectorProperties.getKnowledgeCollection())
                .build();
    }

    @Bean
    public ChatModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .httpClientBuilder(new JdkHttpClientBuilder()
                        .connectTimeout(chatTimeout)
                        .readTimeout(chatTimeout))
                .apiKey(dashscopeApiKey)
                .modelName(chatModelName)
                .baseUrl(chatBaseUrl)
                .temperature(chatTemperature)
                .maxTokens(chatMaxTokens)
                .timeout(chatTimeout)
                .maxRetries(chatMaxRetries)
                .logRequests(chatLogRequests)
                .logResponses(chatLogResponses)
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
