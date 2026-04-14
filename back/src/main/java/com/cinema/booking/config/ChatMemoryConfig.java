package com.cinema.booking.config;

import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

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

    private final RedisChatMemoryStore chatMemoryStore;

    /**
     * 创建用户独立会话
     */
    public ChatMemory createChatMemory(String sessionId) {
        return MessageWindowChatMemory.builder()
                .id(sessionId)
                .chatMemoryStore(chatMemoryStore)
                .maxMessages(10) // 保留最近50条对话
                .build();
    }
}
