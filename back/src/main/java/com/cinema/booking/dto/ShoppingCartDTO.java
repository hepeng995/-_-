package com.cinema.booking.dto;

import lombok.Data;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 购物车DTO
 */
@Data
public class ShoppingCartDTO {
    
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 商品ID
     */
    @NotNull(message = "商品ID不能为空")
    private Long productId;
    
    /**
     * 数量
     */
    @NotNull(message = "数量不能为空")
    @Min(value = 1, message = "数量必须大于0")
    private Integer quantity;
    
    /**
     * 添加时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 商品信息
     */
    private String productName;
    private String productImage;
    private BigDecimal productPrice;
    private Integer productStock;
    private String productUnit;
    
    /**
     * 小计金额
     */
    private BigDecimal totalPrice;
    
    /**
     * 是否选中
     */
    private Boolean selected = false;
}
