package com.cinema.booking.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiConfigurationGuard {

    private final AiVectorProperties aiVectorProperties;

    @Value("${langchain4j.open-ai.chat-model.api-key}")
    private String dashscopeApiKey;

    @Value("${langchain4j.open-ai.chat-model.model-name:qwen-turbo}")
    private String chatModelName;

    @Value("${langchain4j.open-ai.chat-model.base-url:https://dashscope.aliyuncs.com/compatible-mode/v1}")
    private String chatBaseUrl;

    @PostConstruct
    public void validateConfiguration() {
        if (!isConfigured(dashscopeApiKey)) {
            throw new IllegalStateException("DashScope API Key 未配置，AI 模块不可启动");
        }
        if (!StringUtils.hasText(chatModelName)) {
            throw new IllegalStateException("AI 聊天模型名称未配置，AI 模块不可启动");
        }
        if (!StringUtils.hasText(chatBaseUrl)) {
            throw new IllegalStateException("AI Base URL 未配置，AI 模块不可启动");
        }
        if (!StringUtils.hasText(aiVectorProperties.getEmbeddingModelName())) {
            throw new IllegalStateException("AI 向量模型名称未配置，AI 模块不可启动");
        }

        log.info("AI 配置检查通过: chatModel={}, embeddingModel={}, qdrant={}:{} (grpc:{}), apiKeyConfigured={}",
                chatModelName,
                aiVectorProperties.getEmbeddingModelName(),
                aiVectorProperties.getQdrantHost(),
                aiVectorProperties.getQdrantHttpPort(),
                aiVectorProperties.getQdrantGrpcPort(),
                isConfigured(dashscopeApiKey));
    }

    public Map<String, Object> healthStatus() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("configured", isConfigured(dashscopeApiKey));
        result.put("chatModelName", chatModelName);
        result.put("embeddingModelName", aiVectorProperties.getEmbeddingModelName());
        result.put("qdrantHost", aiVectorProperties.getQdrantHost());
        result.put("qdrantHttpPort", aiVectorProperties.getQdrantHttpPort());
        result.put("qdrantGrpcPort", aiVectorProperties.getQdrantGrpcPort());
        result.put("knowledgeCollection", aiVectorProperties.getKnowledgeCollection());
        return result;
    }

    private boolean isConfigured(String value) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        String normalized = value.trim();
        return !normalized.startsWith("PLEASE_SET_") && !normalized.contains("YOUR_");
    }
}
