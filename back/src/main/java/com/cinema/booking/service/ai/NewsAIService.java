package com.cinema.booking.service.ai;

import com.cinema.booking.dto.AiNewsDTO;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;

import java.util.List;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai
 * @createTime 2026-04-13  16:17
 * @description TODO
 */
public interface NewsAIService {
    @Tool("当用户询问乡村振兴政策、新闻资讯、村务公开、论坛文章或村民建言时调用。")
    List<AiNewsDTO> searchVillageInfo(
            @P("搜索关键词，例如'数字村官'、'直播'、'分红'") String keyword,
            @P("检索类型：'news'代表官方政策和新闻，'forum'代表村民论坛帖子。如果不确定，优先传'news'") String type
    );
}
