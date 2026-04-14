package com.cinema.booking.config;

import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIConfig {

    /**
     * 1. 配置本地向量嵌入模型 (完全免费，基于 ONNX 在 JVM 运行)
     */
    /**
     * 配置本地嵌入模型（All-MiniLM-L6-v2，384维向量）
     */
    @Bean
    public EmbeddingModel embeddingModel() {
        return new AllMiniLmL6V2EmbeddingModel();
    }

    /**
     * 配置  向量存储
     */
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        // 连接你已有的 Qdrant 容器（端口 6333）
        QdrantClient qdrantClient = new QdrantClient(
                QdrantGrpcClient.newBuilder("localhost", 6334, false).build()
        );



        return QdrantEmbeddingStore.builder()
                .client(qdrantClient)
                .collectionName("village_knowledge_base")

//                .vectorSize(384) // 匹配 All-MiniLM-L6-v2 的 384 维向量
                .build();
    }

}
