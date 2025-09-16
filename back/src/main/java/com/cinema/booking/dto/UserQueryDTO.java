package com.cinema.booking.dto;

import lombok.Data;

/**
 * 用户查询条件DTO
 */
@Data
public class UserQueryDTO {
    /**
     * 当前页码
     */
    private Integer current = 1;

    /**
     * 每页大小
     */
    private Integer size = 10;

    /**
     * 用户名
     */
    private String username;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号码
     */
    private String phoneNumber;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 角色
     */
    private String role;

    /**
     * 是否启用
     */
    private Boolean enabled;
} 