package com.cinema.booking.service;

import com.cinema.booking.model.dto.SystemLogDTO;
import com.cinema.booking.model.entity.SystemLog;
import com.cinema.booking.model.query.SystemLogQuery;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 系统日志服务接口
 */
public interface SystemLogService {

    /**
     * 添加系统日志
     *
     * @param log 日志信息
     * @return 是否成功
     */
    boolean addSystemLog(SystemLog log);

    /**
     * 获取系统日志分页列表
     *
     * @param query 查询参数
     * @return 分页数据
     */
    Map<String, Object> getSystemLogPage(SystemLogQuery query);

    /**
     * 获取系统日志详情
     *
     * @param id 日志ID
     * @return 日志详情
     */
    SystemLogDTO getSystemLogById(Long id);

    /**
     * 删除系统日志
     *
     * @param id 日志ID
     * @return 是否成功
     */
    boolean deleteSystemLog(Long id);

    /**
     * 批量删除系统日志
     *
     * @param ids 日志ID列表
     * @return 是否成功
     */
    boolean batchDeleteSystemLogs(List<Long> ids);

    /**
     * 清空系统日志
     *
     * @return 是否成功
     */
    boolean clearSystemLogs();

    /**
     * 导出系统日志
     *
     * @param query 查询参数
     */
    void exportSystemLogs(SystemLogQuery query);

    /**
     * 获取操作类型列表
     *
     * @return 操作类型列表
     */
    List<String> getOperationTypes();

    /**
     * 获取模块列表
     *
     * @return 模块列表
     */
    List<String> getModules();

    /**
     * 获取操作统计数据
     *
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 统计数据
     */
    Map<String, Object> getOperationStats(Date startTime, Date endTime);
} 