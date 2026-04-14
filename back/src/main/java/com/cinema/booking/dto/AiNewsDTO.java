package com.cinema.booking.dto;

import lombok.Data;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.dto
 * @createTime 2026-04-13  16:17
 * @description TODO
 */

@Data
public class AiNewsDTO {
    private Long id;
    private String title;
    private String summary; // 文章摘要或截取的前50个字
    private String type;    // "news" 或 "forum"
}
