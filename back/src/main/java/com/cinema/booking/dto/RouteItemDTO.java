package com.cinema.booking.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RouteItemDTO {
    private Long id;
    private Long routeId;
    private Integer dayNumber;
    private Integer sortOrder;
    private Long attractionId;
    private String suggestedDuration;
    private String transportMethod;
    private String note;

    private String attractionName;
    private String attractionCover;
    private String attractionDescription;
    private BigDecimal attractionLongitude;
    private BigDecimal attractionLatitude;
    private String attractionAddress;
}
