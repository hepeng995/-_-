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
    // 🔥 关键：强制AI返回标准JSON，复用你的ProductDTO字段
    @UserMessage("""
            你是桃源县文旅智能导购，必须严格遵守：
            1. 仅基于检索到的商品数据回答，禁止编造，当与用户的商品关键词匹配数量不够时从检索到的商品数据按照价格按低到高为用户推荐特产
            2. 只返回【纯JSON】，无任何多余文字
            3. JSON结构固定：
            {
                "recommendText": "友好的推荐话术",
                "productList": [
                    {
                        "id": 商品ID,
                        "productName": "商品名称",
                        "price": "价格",
                        "description": "商品描述",
                        "detailUrl": "https://localhost:5173/product/商品ID"
                    }
                ]
            }
            4. productList 返回 3-5 个最相关商品
            5. detailUrl 必须是前端路由地址，禁止后端接口
            
            用户问题：{{it}}
            """)
    String answer(String message);
}
