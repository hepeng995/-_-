package com.cinema.booking.dto;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.dto
 * @createTime 2026-04-14  17:41
 * @description TODO
 */

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 通用卡片数据传输对象
 * 用途：四大模块（特产/景点/资讯/建言）统一前端渲染卡片
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "通用卡片实体")
public class CommonCardDTO {

    @Schema(description = "数据唯一ID")
    private Long id;

    @Schema(description = "卡片标题（商品名/景点名/文章标题）")
    private String title;

    @Schema(description = "卡片描述/简介")
    private String content;

    @Schema(description = "额外信息（价格/发布时间/景点地址）")
    private String extra;

    @Schema(description = "图片地址")
    private String images;

    @Schema(description = "前端详情页跳转链接")
    private String detailUrl;
}
