package com.cinema.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActivityRegistrationDTO {

    private Long id;

    @NotNull(message = "活动ID不能为空")
    private Long activityId;

    private Long userId;

    private String activityTitle;

    @NotBlank(message = "联系人姓名不能为空")
    private String contactName;

    @NotBlank(message = "联系电话不能为空")
    private String contactPhone;

    @NotNull(message = "参加人数不能为空")
    @Min(value = 1, message = "参加人数至少为1")
    private Integer participantCount;

    private String remark;

    private String status;

    private String createdAt;
}
