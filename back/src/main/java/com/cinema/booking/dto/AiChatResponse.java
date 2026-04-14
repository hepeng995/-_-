package com.cinema.booking.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.dto
 * @createTime 2026-04-14  17:39
 * @description TODO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "AI统一响应")
public class AiChatResponse {
    @Schema(description = "会话ID(前端必存，用于多轮对话)")
    private String sessionId;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "AI回答文本")
    private String recommendText;

    @Schema(description = "模块类型：PRODUCT/SCENIC/NEWS/ADVICE")
    private String moduleType;

    @Schema(description = "结构化卡片数据")
    private List<CommonCardDTO> cardList;
}
