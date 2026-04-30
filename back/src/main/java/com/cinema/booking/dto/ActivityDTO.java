package com.cinema.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ActivityDTO {

    private Long id;

    @NotBlank(message = "活动标题不能为空")
    private String title;

    private List<String> coverImages;

    private String description;

    @NotBlank(message = "活动分类不能为空")
    private String category;

    @NotBlank(message = "开始时间不能为空")
    private String startTime;

    @NotBlank(message = "结束时间不能为空")
    private String endTime;

    @NotBlank(message = "活动地点不能为空")
    private String location;

    private String organizer;

    private String contactPhone;

    @NotNull(message = "活动费用不能为空")
    private BigDecimal fee;

    private String feeText;

    private Integer maxParticipants;

    private Integer currentParticipants;

    private String registrationDeadline;

    private String status;

    private List<String> images;

    private List<String> tags;

    private String createdAt;
}
