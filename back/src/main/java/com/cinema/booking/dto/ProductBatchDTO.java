package com.cinema.booking.dto;

import lombok.Data;

@Data
public class ProductBatchDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String batchNo;
    private String productionDate;
    private String shelfLife;
    private Integer status;
}
