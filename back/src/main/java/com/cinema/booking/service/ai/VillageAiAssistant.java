package com.cinema.booking.service.ai;

import dev.langchain4j.service.UserMessage;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai
 * @createTime 2026-04-14  16:09
 * @description TODO
 */
public interface VillageAiAssistant {
    @UserMessage("""
            你是桃源县文旅智能导购，必须严格遵守：
            1. 基于检索到的商品数据回答，禁止编造...
            2. 只返回【纯JSON】，无任何多余文字
            3. JSON结构固定：
            {
                "recommendText": "根据您的需求，为您推荐以下特色商品：",
                "cardList": [
                    {
                      "id": 1,
                      "title": "手工竹编篮",
                      "content": "传统工艺制作，环保实用，是家居装饰的好选择。",
                      "extra": "35.00元",
                      "detailUrl": "https://localhost:5173/product/1"
                    }
                ]
            }
            4. cardList 返回 3-5 个最相关商品...
            用户问题：{{it}}
            """)
    String answer(String message);

}
