package com.cinema.booking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("route_items")
public class RouteItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("route_id")
    private Long routeId;

    @TableField("day_number")
    private Integer dayNumber;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("attraction_id")
    private Long attractionId;

    @TableField("suggested_duration")
    private String suggestedDuration;

    @TableField("transport_method")
    private String transportMethod;

    private String note;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
