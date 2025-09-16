package com.cinema.booking.model.query;

import lombok.Data;

import java.util.Date;

/**
 * 系统日志查询参数
 */
@Data
public class SystemLogQuery {

    /**
     * 页码
     */
    private Integer pageNum = 1;

    /**
     * 每页记录数
     */
    private Integer pageSize = 10;

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
     * 操作状态（1：成功，0：失败）
     */
    private Integer status;

    /**
     * 开始时间
     */
    private Date startTime;

    /**
     * 结束时间
     */
    private Date endTime;
} 