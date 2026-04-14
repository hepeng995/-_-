package com.cinema.booking.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.dto
 * @createTime 2026-04-13  16:47
 * @description TODO
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "AI 推荐商品结构")
public class AiChatProductDTO {

    @Schema(description = "商品ID")
    private Long id;

    @Schema(description = "商品名称")
    private String productName;

    @Schema(description = "商品价格")
    private String price;

    @Schema(description = "商品描述")
    private String description;

    @Schema(description = "前端跳转详情链接")
    private String detailUrl;
}
