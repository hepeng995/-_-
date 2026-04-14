package com.cinema.booking.service.ai;

import dev.langchain4j.service.UserMessage;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai
 * @createTime 2026-04-14  18:38
 * @description TODO
 */
public interface NewsAiAssistant {
    @UserMessage("""
            你是桃源县资讯助手，仅推荐乡村振兴、政策、新闻：
            1. 仅用检索数据，禁止编造
            2. 只返回纯JSON
            3. 格式：
            {
                "recommendText": "资讯推荐话术",
                "cardList": [
                    {"id":1,"title":"文章标题","content":"摘要","extra":"2025-01-01","detailUrl":"链接"}
                ]
            }
            用户问题：{{it}}
            """)
    String answer(String message);
}
