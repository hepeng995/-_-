package com.cinema.booking.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

/**
 * 收货地址DTO
 */
@Data
@Schema(description = "收货地址DTO")
public class AddressDTO {
    
    @Schema(description = "地址ID")
    private Long id;
    
    @Schema(description = "用户ID")
    private Long userId;
    
    @NotBlank(message = "收货人姓名不能为空")
    @Schema(description = "收货人姓名")
    private String receiverName;
    
    @NotBlank(message = "收货人电话不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    @Schema(description = "收货人电话")
    private String receiverPhone;
    
    @NotBlank(message = "省份不能为空")
    @Schema(description = "省份")
    private String province;
    
    @NotBlank(message = "城市不能为空")
    @Schema(description = "城市")
    private String city;
    
    @NotBlank(message = "区县不能为空")
    @Schema(description = "区县")
    private String district;
    
    @NotBlank(message = "详细地址不能为空")
    @Schema(description = "详细地址")
    private String detailAddress;
    
    @Schema(description = "邮政编码")
    private String postalCode;
    
    @Schema(description = "是否为默认地址")
    private Boolean isDefault;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
