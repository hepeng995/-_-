package com.cinema.booking.aspect;

import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.model.entity.SystemLog;
import com.cinema.booking.service.SystemLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 系统日志切面
 * 拦截带有SystemOperation注解的方法，记录操作日志
 */
@Slf4j
@Aspect
@Component
public class SystemLogAspect {

    @Autowired
    private SystemLogService systemLogService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 定义切点 - 拦截所有带SystemOperation注解的方法
     */
    @Pointcut("@annotation(com.cinema.booking.annotation.SystemOperation)")
    public void systemLogPointcut() {
    }

    /**
     * 环绕通知 - 记录系统操作日志
     */
    @Around("systemLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        log.info("=== 系统日志切面开始执行 ===");
        long startTime = System.currentTimeMillis();
        SystemLog systemLog = new SystemLog();
        
        // 设置操作时间
        systemLog.setCreatedAt(new Date());
        
        try {
            // 获取当前请求
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                // 设置请求URL
                systemLog.setRequestUrl(request.getRequestURI());
                // 设置请求方法
                systemLog.setRequestMethod(request.getMethod());
                // 设置IP地址
                systemLog.setIpAddress(getIpAddress(request));
                
                // 设置请求参数
                Map<String, Object> paramMap = getRequestParams(joinPoint);
                try {
                    systemLog.setRequestParams(objectMapper.writeValueAsString(paramMap));
                    log.debug("请求参数: {}", systemLog.getRequestParams());
                } catch (Exception e) {
                    log.error("序列化请求参数失败", e);
                    systemLog.setRequestParams("参数序列化失败: " + e.getMessage());
                }
            } else {
                log.warn("无法获取当前请求信息");
            }
            
            // 获取注解信息
            SystemOperation systemOperation = getSystemOperationAnnotation(joinPoint);
            if (systemOperation != null) {
                systemLog.setModule(systemOperation.module());
                systemLog.setOperation(systemOperation.operation());
                systemLog.setDescription(systemOperation.description());
                log.info("操作模块: {}, 操作类型: {}", systemOperation.module(), systemOperation.operation());
            } else {
                log.warn("无法获取SystemOperation注解信息");
            }
            
            // 获取当前用户信息
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                systemLog.setUsername(username);
                log.info("当前用户: {}", username);
                // 用户ID需要从认证对象中提取，这里简化处理
                // systemLog.setUserId(getUserId(authentication));
            } else {
                systemLog.setUsername("匿名用户");
                log.info("用户未认证，记录为匿名用户");
            }
            
            // 执行目标方法
            Object result = null;
            try {
                result = joinPoint.proceed();
                // 设置操作状态为成功
                systemLog.setStatus(1);
                return result;
            } catch (Exception e) {
                // 设置操作状态为失败
                systemLog.setStatus(0);
                // 记录错误信息
                systemLog.setErrorMessage(e.getMessage());
                log.error("方法执行异常", e);
                throw e;
            } finally {
                // 计算执行时间
                long executionTime = System.currentTimeMillis() - startTime;
                systemLog.setExecutionTime(executionTime);
                
                // 异步保存日志
                try {
                    boolean saved = systemLogService.addSystemLog(systemLog);
                    if (saved) {
                        log.info("系统日志保存成功, 执行时间: {}ms", executionTime);
                    } else {
                        log.error("系统日志保存失败");
                    }
                } catch (Exception e) {
                    log.error("保存系统日志异常", e);
                }
            }
        } catch (Exception e) {
            log.error("系统日志切面处理异常", e);
            return joinPoint.proceed(); // 确保原方法继续执行
        } finally {
            log.info("=== 系统日志切面结束执行 ===");
        }
    }

    /**
     * 获取SystemOperation注解
     */
    private SystemOperation getSystemOperationAnnotation(JoinPoint joinPoint) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            return method.getAnnotation(SystemOperation.class);
        } catch (Exception e) {
            log.error("获取SystemOperation注解失败", e);
            return null;
        }
    }

    /**
     * 获取请求参数
     */
    private Map<String, Object> getRequestParams(JoinPoint joinPoint) {
        Map<String, Object> params = new HashMap<>();
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            String[] parameterNames = signature.getParameterNames();
            Object[] args = joinPoint.getArgs();
            
            if (parameterNames != null && parameterNames.length > 0) {
                for (int i = 0; i < parameterNames.length; i++) {
                    if (args[i] != null) {
                        // 避免记录敏感信息，如密码
                        if (parameterNames[i].toLowerCase().contains("password") 
                            || parameterNames[i].toLowerCase().contains("pwd")) {
                            params.put(parameterNames[i], "******");
                        } else {
                            params.put(parameterNames[i], args[i]);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("获取请求参数失败", e);
        }
        return params;
    }

    /**
     * 获取客户端IP地址
     */
    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多个代理的情况，第一个IP为客户端真实IP
        if (ip != null && ip.indexOf(",") > 0) {
            ip = ip.substring(0, ip.indexOf(","));
        }
        return ip;
    }
} 