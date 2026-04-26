package com.cinema.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AmapSyncRequest {

    @NotBlank(message = "搜索区域不能为空")
    private String region;

    @NotBlank(message = "关键词不能为空")
    private String keyword;

    private Integer maxPages = 5;
}
