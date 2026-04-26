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
@TableName("trace_records")
public class TraceRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("product_id")
    private Long productId;

    @TableField("product_name")
    private String productName;

    @TableField("batch_no")
    private String batchNo;

    private String stage;

    private String title;

    private String description;

    private String images;

    private String location;

    @TableField("operator")
    private String operatorName;

    @TableField("operator_type")
    private String operatorType;

    @TableField("operation_date")
    private String operationDate;

    private String notes;

    @TableField("is_quality_check")
    private Boolean isQualityCheck;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    private Boolean deleted;
}
