package com.cinema.booking.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AiConfigurationGuardTest {

    @Test
    void validateConfigurationFailsWhenApiKeyIsPlaceholder() {
        AiVectorProperties properties = new AiVectorProperties();
        AiConfigurationGuard guard = new AiConfigurationGuard(properties);
        ReflectionTestUtils.setField(guard, "dashscopeApiKey", "PLEASE_SET_DASHSCOPE_API_KEY");
        ReflectionTestUtils.setField(guard, "chatModelName", "qwen-turbo");
        ReflectionTestUtils.setField(guard, "chatBaseUrl", "https://dashscope.aliyuncs.com/compatible-mode/v1");

        IllegalStateException ex = assertThrows(IllegalStateException.class, guard::validateConfiguration);
        assertTrue(ex.getMessage().contains("DashScope API Key 未配置"));
    }

    @Test
    void healthStatusReportsConfiguredWhenValuesArePresent() {
        AiVectorProperties properties = new AiVectorProperties();
        properties.setEmbeddingModelName("text-embedding-v3");
        properties.setQdrantHost("qdrant");
        properties.setQdrantHttpPort(6333);
        properties.setQdrantGrpcPort(6334);
        properties.setKnowledgeCollection("village_knowledge_base_qwen_v3_1024");

        AiConfigurationGuard guard = new AiConfigurationGuard(properties);
        ReflectionTestUtils.setField(guard, "dashscopeApiKey", "sk-valid-demo-key");
        ReflectionTestUtils.setField(guard, "chatModelName", "qwen-turbo");
        ReflectionTestUtils.setField(guard, "chatBaseUrl", "https://dashscope.aliyuncs.com/compatible-mode/v1");

        guard.validateConfiguration();

        assertEquals(true, guard.healthStatus().get("configured"));
        assertEquals("qwen-turbo", guard.healthStatus().get("chatModelName"));
        assertEquals("text-embedding-v3", guard.healthStatus().get("embeddingModelName"));
    }
}
