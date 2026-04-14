package com.cinema.booking.service.ai;

import com.cinema.booking.dto.AiAttractionDTO;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;

import java.util.List;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai
 * @createTime 2026-04-13  16:18
 * @description TODO
 */
public interface AttractionAIService {
    @Tool("当用户询问当地旅游景点、游玩去处、农家乐或景点门票时调用。")
    List<AiAttractionDTO> searchAttractions(
            @P("景点相关关键词，例如'漂流'、'古镇'、'采摘'") String keyword,
            @P("用户期望的最高门票价格，如果没有预算限制则传 null") Double maxTicketPrice
    );
}
