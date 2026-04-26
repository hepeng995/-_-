package com.cinema.booking.dto;

import lombok.Data;

import java.util.List;

@Data
public class TraceRecordDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String batchNo;
    private String stage;
    private String title;
    private String description;
    private List<String> images;
    private String location;
    private String operatorName;
    private String operatorType;
    private String operationDate;
    private List<String> notes;
    private Boolean isQualityCheck;
    private String createdAt;
}
