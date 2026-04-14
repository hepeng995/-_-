package com.cinema.booking.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.dto
 * @createTime 2026-04-13  15:13
 * @description TODO
 */

@Data
@Schema(description = "AI 对话请求参数")
public class AiChatRequestDTO {
    @Schema(description = "会话ID，为空则创建新会话")
    private String sessionId;

    @Schema(description = "用户输入的自然语言消息", requiredMode = Schema.RequiredMode.REQUIRED)
    private String message;

    @Schema(description = "用户当前经度")
    private Double longitude;

    @Schema(description = "用户当前纬度")
    private Double latitude;
}
