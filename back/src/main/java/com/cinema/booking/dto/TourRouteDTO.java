package com.cinema.booking.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TourRouteDTO {
    private Long id;
    private String name;
    private String coverImage;
    private String description;
    private Integer days;
    private String difficulty;
    private String suitableCrowd;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private List<String> tags;
    private String tips;
    private Integer viewCount;
    private BigDecimal rating;
    private Integer ratingCount;
    private Boolean isOfficial;
    private Integer status;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<RouteItemDTO> items;
    private String difficultyLabel;
}
