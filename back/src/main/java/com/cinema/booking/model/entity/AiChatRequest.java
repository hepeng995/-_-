package com.cinema.booking.model.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.model.entity
 * @createTime 2026-04-14  17:33
 * @description TODO
 */

@Data
@Schema(description = "AI对话统一请求")
public class AiChatRequest {
    @Schema(description = "会话ID(非必填，第一次由后端生成)")
    private String sessionId;

    @Schema(description = "用户提问内容", required = true)
    private String message;

    @Schema(description = "用户ID(建言献策专用，必传)")
    private Long userId;
}
