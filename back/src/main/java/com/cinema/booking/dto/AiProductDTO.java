package com.cinema.booking.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.dto
 * @createTime 2026-04-13  15:13
 * @description TODO
 */

@Data
public class AiProductDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer salesCount;
    private String description;
}
