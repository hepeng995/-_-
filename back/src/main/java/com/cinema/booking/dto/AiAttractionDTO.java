package com.cinema.booking.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.dto
 * @createTime 2026-04-13  15:14
 * @description TODO
 */

@Data
public class AiAttractionDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal ticketPrice; // 门票价格
}
