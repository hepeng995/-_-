package com.cinema.booking.dto;

import lombok.Data;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单DTO
 */
@Data
public class OrderDTO {
    
    private Long id;
    
    /**
     * 订单号
     */
    private String orderNo;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 订单总金额
     */
    @NotNull(message = "订单总金额不能为空")
    @DecimalMin(value = "0.01", message = "订单总金额必须大于0")
    private BigDecimal totalAmount;
    
    /**
     * 优惠金额
     */
    @DecimalMin(value = "0.00", message = "优惠金额不能为负数")
    private BigDecimal discountAmount;
    
    /**
     * 实付金额
     */
    @NotNull(message = "实付金额不能为空")
    @DecimalMin(value = "0.01", message = "实付金额必须大于0")
    private BigDecimal actualAmount;
    
    /**
     * 支付方式
     */
    private String paymentMethod;
    
    /**
     * 支付状态：0待支付，1已支付，2支付失败
     */
    private Integer paymentStatus;
    
    /**
     * 订单状态：1待支付，2待发货，3已发货，4已收货，5已取消，6已退款
     */
    private Integer orderStatus;
    
    /**
     * 收货地址
     */
    @NotBlank(message = "收货地址不能为空")
    private String deliveryAddress;
    
    /**
     * 收货人姓名
     */
    @NotBlank(message = "收货人姓名不能为空")
    private String deliveryName;
    
    /**
     * 收货人电话
     */
    @NotBlank(message = "收货人电话不能为空")
    private String deliveryPhone;
    
    /**
     * 订单备注
     */
    private String remark;
    
    /**
     * 支付时间
     */
    private LocalDateTime paymentTime;
    
    /**
     * 发货时间
     */
    private LocalDateTime deliveryTime;
    
    /**
     * 收货时间
     */
    private LocalDateTime receivedTime;
    
    /**
     * 取消时间
     */
    private LocalDateTime cancelledTime;
    
    /**
     * 取消原因
     */
    private String cancelReason;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 订单明细列表
     */
    @NotEmpty(message = "订单明细不能为空")
    private List<OrderItemDTO> orderItems;
    
    /**
     * 状态描述
     */
    private String statusDesc;
    
    /**
     * 支付状态描述
     */
    private String paymentStatusDesc;
}
