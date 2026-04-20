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
}
