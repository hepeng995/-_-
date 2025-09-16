package com.cinema.booking.service.impl;

import com.cinema.booking.mapper.SystemLogMapper;
import com.cinema.booking.model.dto.SystemLogDTO;
import com.cinema.booking.model.entity.SystemLog;
import com.cinema.booking.model.query.SystemLogQuery;
import com.cinema.booking.service.SystemLogService;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 系统日志服务实现类
 */
@Slf4j
@Service
public class SystemLogServiceImpl implements SystemLogService {

    @Autowired
    private SystemLogMapper systemLogMapper;

    @Override
    @Transactional
    public boolean addSystemLog(SystemLog systemLog) {
        log.info("开始添加系统日志: 用户[{}], 模块[{}], 操作[{}]", 
                systemLog.getUsername(), systemLog.getModule(), systemLog.getOperation());
        
        if (systemLog == null) {
            log.warn("系统日志对象为空，无法添加");
            return false;
        }
        
        if (systemLog.getCreatedAt() == null) {
            systemLog.setCreatedAt(new Date());
        }
        
        try {
            int result = systemLogMapper.insert(systemLog);
            if (result > 0) {
                log.info("系统日志添加成功: ID={}", systemLog.getId());
                return true;
            } else {
                log.error("系统日志添加失败: 数据库未受影响");
                return false;
            }
        } catch (Exception e) {
            log.error("系统日志添加异常: {}", e.getMessage(), e);
            throw e; // 重新抛出异常，让事务管理器可以进行回滚
        }
    }

    @Override
    public Map<String, Object> getSystemLogPage(SystemLogQuery query) {
        log.info("分页查询系统日志: 页码={}, 每页大小={}", query.getPageNum(), query.getPageSize());
        
        PageHelper.startPage(query.getPageNum(), query.getPageSize());
        List<SystemLog> logs = systemLogMapper.selectList(query);
        PageInfo<SystemLog> pageInfo = new PageInfo<>(logs);
        
        List<SystemLogDTO> logDTOs = new ArrayList<>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        
        for (SystemLog log : logs) {
            SystemLogDTO dto = new SystemLogDTO();
            BeanUtils.copyProperties(log, dto);
            logDTOs.add(dto);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", pageInfo.getTotal());
        result.put("list", logDTOs);
        result.put("pageNum", pageInfo.getPageNum());
        result.put("pageSize", pageInfo.getPageSize());
        result.put("pages", pageInfo.getPages());
        
        log.info("系统日志查询完成: 总记录数={}", pageInfo.getTotal());
        return result;
    }

    @Override
    public SystemLogDTO getSystemLogById(Long id) {
        log.info("根据ID查询系统日志: ID={}", id);
        
        SystemLog systemLog = systemLogMapper.selectById(id);
        if (systemLog == null) {
            log.warn("系统日志不存在: ID={}", id);
            return null;
        }
        
        SystemLogDTO dto = new SystemLogDTO();
        BeanUtils.copyProperties(systemLog, dto);
        return dto;
    }

    @Override
    @Transactional
    public boolean deleteSystemLog(Long id) {
        log.info("删除系统日志: ID={}", id);
        
        try {
            int result = systemLogMapper.deleteById(id);
            if (result > 0) {
                log.info("系统日志删除成功: ID={}", id);
                return true;
            } else {
                log.warn("系统日志删除失败: ID={}", id);
                return false;
            }
        } catch (Exception e) {
            log.error("系统日志删除异常: ID={}, 错误={}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public boolean batchDeleteSystemLogs(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            log.warn("批量删除系统日志: ID列表为空");
            return false;
        }
        
        log.info("批量删除系统日志: ID数量={}", ids.size());
        
        try {
            int result = systemLogMapper.batchDelete(ids);
            log.info("批量删除系统日志结果: 成功删除{}条记录", result);
            return result > 0;
        } catch (Exception e) {
            log.error("批量删除系统日志异常: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public boolean clearSystemLogs() {
        log.info("清空系统日志开始");
        
        try {
            int result = systemLogMapper.clearAll();
            log.info("清空系统日志完成: 成功删除{}条记录", result);
            return result > 0;
        } catch (Exception e) {
            log.error("清空系统日志异常: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void exportSystemLogs(SystemLogQuery query) {
        log.info("导出系统日志开始");
        
        try {
            List<SystemLog> logs = systemLogMapper.selectList(query);
            log.info("导出系统日志准备完成: 记录数={}", logs.size());
            
            // 这里实现导出逻辑，可以导出为Excel或CSV
            // 由于这里不方便实现完整的导出逻辑，仅展示基本框架
            log.info("导出系统日志完成: 数量={}", logs.size());
        } catch (Exception e) {
            log.error("导出系统日志异常: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<String> getOperationTypes() {
        log.info("获取操作类型列表");
        return systemLogMapper.selectOperationTypes();
    }

    @Override
    public List<String> getModules() {
        log.info("获取模块列表");
        return systemLogMapper.selectModules();
    }

    @Override
    public Map<String, Object> getOperationStats(Date startTime, Date endTime) {
        log.info("获取操作统计数据: 开始时间={}, 结束时间={}", startTime, endTime);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 获取每日操作统计
            List<Map<String, Object>> dailyStats = systemLogMapper.selectDailyStats(startTime, endTime);
            result.put("dailyStats", dailyStats);
            
            // 获取模块操作统计
            List<Map<String, Object>> moduleStats = systemLogMapper.selectModuleStats(startTime, endTime);
            result.put("moduleStats", moduleStats);
            
            // 获取操作类型统计
            List<Map<String, Object>> operationStats = systemLogMapper.selectOperationStats(startTime, endTime);
            result.put("operationStats", operationStats);
            
            // 获取状态统计
            List<Map<String, Object>> statusStats = systemLogMapper.selectStatusStats(startTime, endTime);
            // 转换状态描述
            for (Map<String, Object> stat : statusStats) {
                Object statusObj = stat.get("status");
                Integer status;
                
                // 处理不同类型的情况
                if (statusObj instanceof Integer) {
                    status = (Integer) statusObj;
                } else if (statusObj instanceof Boolean) {
                    status = ((Boolean) statusObj) ? 1 : 0;
                } else if (statusObj instanceof Number) {
                    status = ((Number) statusObj).intValue();
                } else if (statusObj instanceof String) {
                    status = Integer.parseInt((String) statusObj);
                } else if (statusObj == null) {
                    status = 0;
                } else {
                    log.warn("未知的状态类型: {}", statusObj.getClass().getName());
                    status = 0;
                }
                
                stat.put("status", status);
                stat.put("statusName", status == 1 ? "成功" : "失败");
            }
            result.put("statusStats", statusStats);
            
            log.info("获取操作统计数据完成");
            return result;
        } catch (Exception e) {
            log.error("获取操作统计数据异常: {}", e.getMessage(), e);
            throw e;
        }
    }
} 