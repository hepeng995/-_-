package com.cinema.booking.dto;

import lombok.Data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

/**
 * 用户更新数据传输对象
 */
@Data
public class UserUpdateDTO {
    
    /**
     * 用户ID
     */
    private Long id;
    
    /**
     * 真实姓名
     */
    private String realName;
    
    /**
     * 电子邮箱
     */
    @Email(message = "邮箱格式不正确")
    private String email;
    
    /**
     * 手机号码
     */
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phoneNumber;
    
    /**
     * 用户头像URL
     */
    private String avatar;
    
    /**
     * 旧密码（修改密码时需要）
     */
    private String oldPassword;
    
    /**
     * 新密码（修改密码时需要）
     */
    private String newPassword;
    
    /**
     * 确认新密码（修改密码时需要）
     */
    private String confirmPassword;
    
    /**
     * 角色（管理员可修改）
     */
    private String role;
    
    /**
     * 状态：是否启用（管理员可修改）
     */
    private Boolean enabled;
} 