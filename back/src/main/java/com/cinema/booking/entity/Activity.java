package com.cinema.booking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("activities")
public class Activity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    @TableField("cover_images")
    private String coverImages;

    private String description;

    private String category;

    @TableField("start_time")
    private LocalDateTime startTime;

    @TableField("end_time")
    private LocalDateTime endTime;

    private String location;

    private String organizer;

    @TableField("contact_phone")
    private String contactPhone;

    private BigDecimal fee;

    @TableField("max_participants")
    private Integer maxParticipants;

    @TableField("current_participants")
    private Integer currentParticipants;

    @TableField("registration_deadline")
    private LocalDateTime registrationDeadline;

    private String status;

    private String images;

    private String tags;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    private Boolean deleted;
}
