package com.cinema.booking.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 系统日志数据传输对象
 */
@Data
public class SystemLogDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 日志ID
     */
    private Long id;

    /**
     * 操作用户ID
     */
    private Long userId;

    /**
     * 操作用户名
     */
    private String username;

    /**
     * 操作模块
     */
    private String module;

    /**
     * 操作类型
     */
    private String operation;

    /**
     * 操作描述
     */
    private String description;

    /**
     * 请求方法
     */
    private String requestMethod;

    /**
     * 请求URL
     */
    private String requestUrl;

    /**
     * 请求参数
     */
    private String requestParams;

    /**
     * 操作IP地址
     */
    private String ipAddress;

    /**
     * 操作状态（1：成功，0：失败）
     */
    private Integer status;

    /**
     * 操作状态字符串
     */
    private String statusStr;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 执行时长(毫秒)
     */
    private Long executionTime;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createdAt;

    /**
     * 创建时间字符串
     */
    private String createdAtStr;

    /**
     * 获取状态字符串
     */
    public String getStatusStr() {
        return status != null ? (status == 1 ? "成功" : "失败") : "";
    }

    /**
     * 获取创建时间字符串
     */
    public String getCreatedAtStr() {
        if (createdAt != null) {
            return new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(createdAt);
        }
        return "";
    }
} 