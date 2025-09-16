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

/**
 * 订单实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("orders")
public class Order {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 订单号
     */
    @TableField("order_no")
    private String orderNo;
    
    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;
    
    /**
     * 订单总金额
     */
    @TableField("total_amount")
    private BigDecimal totalAmount;
    
    /**
     * 优惠金额
     */
    @TableField("discount_amount")
    private BigDecimal discountAmount;
    
    /**
     * 实付金额
     */
    @TableField("actual_amount")
    private BigDecimal actualAmount;
    
    /**
     * 支付方式
     */
    @TableField("payment_method")
    private String paymentMethod;
    
    /**
     * 支付状态：0待支付，1已支付，2支付失败
     */
    @TableField("payment_status")
    private Integer paymentStatus;
    
    /**
     * 订单状态：1待支付，2待发货，3已发货，4已收货，5已取消，6已退款
     */
    @TableField("order_status")
    private Integer orderStatus;
    
    /**
     * 收货地址
     */
    @TableField("delivery_address")
    private String deliveryAddress;
    
    /**
     * 收货人姓名
     */
    @TableField("delivery_name")
    private String deliveryName;
    
    /**
     * 收货人电话
     */
    @TableField("delivery_phone")
    private String deliveryPhone;
    
    /**
     * 订单备注
     */
    private String remark;
    
    /**
     * 支付时间
     */
    @TableField("payment_time")
    private LocalDateTime paymentTime;
    
    /**
     * 发货时间
     */
    @TableField("delivery_time")
    private LocalDateTime deliveryTime;
    
    /**
     * 收货时间
     */
    @TableField("received_time")
    private LocalDateTime receivedTime;
    
    /**
     * 取消时间
     */
    @TableField("cancelled_time")
    private LocalDateTime cancelledTime;
    
    /**
     * 取消原因
     */
    @TableField("cancel_reason")
    private String cancelReason;
    
    /**
     * 创建时间
     */
    @TableField("created_at")
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField("updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * 逻辑删除
     */
    private Boolean deleted;
}
