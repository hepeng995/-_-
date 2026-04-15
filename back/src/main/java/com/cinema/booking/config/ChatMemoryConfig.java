package com.cinema.booking.config;

import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.config
 * @createTime 2026-04-14  14:52
 * @description TODO
 */

@Configuration
@RequiredArgsConstructor
public class ChatMemoryConfig {
    // 【你原来的注入，不动】
    private final RedisChatMemoryStore chatMemoryStore;

    /**
     * 创建用户独立会话（核心方法，完美！）
     */
    public ChatMemory createChatMemory(String sessionId) {
        return MessageWindowChatMemory.builder()
                .id(sessionId)          // 用户ID，隔离上下文
                .chatMemoryStore(chatMemoryStore) // 你的Redis实现
                .maxMessages(50)        // 保留50条对话
                .build();
    }

}
