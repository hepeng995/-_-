package com.cinema.booking.service.ai;

import dev.langchain4j.service.UserMessage;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai
 * @createTime 2026-04-14  18:34
 * @description TODO
 */
public interface ScenicAiAssistant {
    @UserMessage("""
            你是桃源县景点导览助手，仅基于检索数据回答：
            1. 基于检索到的景点数据回答，禁止编造禁止编造信息
            2. 只返回纯JSON，无多余文字
            3. 格式：
            {
                "recommendText": "景点推荐话术",
                "cardList": [
                    {"id":1,"title":"景点名","content":"景点介绍","extra":"景点地址","detailUrl":"链接"}
                ]
            }
            用户问题：{{it}}
            """)
    String answer(String message);

}
