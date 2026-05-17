package com.cinema.booking.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cinema.ai")
public class AiVectorProperties {

    private String embeddingModelName = "text-embedding-v3";
    private String qdrantHost = "localhost";
    private int qdrantHttpPort = 6333;
    private int qdrantGrpcPort = 6334;
    private String knowledgeCollection = "village_knowledge_base_qwen_v3_1024";
    private int knowledgeVectorSize = 1024;
    private float vectorMinScore = 0.5F;
    private String smokeTestQuery = "有什么特色特产推荐？";
    private List<String> legacyCollections = new ArrayList<>(List.of("village_knowledge_base"));

    /**
     * 启动时索引行为：
     * - full：每次启动都全量重建（开发环境）
     * - incremental：仅当 Qdrant 集合不存在或为空时构建（默认推荐）
     * - skip：完全跳过启动构建，由独立 Job 触发
     */
    private String indexingMode = "incremental";
}
