package com.cinema.booking.exception;

import com.cinema.booking.utils.Result;
import com.cinema.booking.utils.ResultCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.HttpStatus;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     */
    @ExceptionHandler(ServiceException.class)
    public Result<?> handleServiceException(ServiceException e) {
        log.error("业务异常: {}", e.getMessage(), e);
        return Result.fail(e.getCode(), e.getMessage());
    }
    // 你的GlobalExceptionHandler添加
    @ExceptionHandler(RuntimeException.class)
    public Result<?> handleAiException(RuntimeException e) {
        log.error("AI服务异常：{}", e.getMessage());
        // 🔥 前端友好提示，不暴露系统错误
        return Result.fail(500, "AI服务繁忙，请稍后再试~", null);
    }

    /**
     * 处理认证异常
     */
    @ExceptionHandler(AuthenticationException.class)
    public Result<Object> handleAuthenticationException(AuthenticationException e) {
        log.error("认证异常: {}", e.getMessage());
        if (e instanceof BadCredentialsException) {
            return Result.fail(ResultCode.UNAUTHORIZED.getCode(), "用户名或密码错误");
        }
        return Result.unauthorized();
    }

    /**
     * 处理权限不足异常
     */
    @ExceptionHandler(AccessDeniedException.class)
    public Result<Object> handleAccessDeniedException(AccessDeniedException e) {
        log.error("权限不足: {}", e.getMessage());
        return Result.forbidden();
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Object> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().stream()
                .map(ObjectError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.error("参数校验错误: {}", message);
        return Result.validateFailed(message);
    }

    /**
     * 处理参数绑定异常
     */
    @ExceptionHandler(BindException.class)
    public Result<Object> handleBindException(BindException e) {
        String message = e.getBindingResult().getAllErrors().stream()
                .map(ObjectError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.error("参数绑定错误: {}", message);
        return Result.validateFailed(message);
    }

    /**
     * 处理约束违反异常
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public Result<Object> handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("; "));
        log.error("约束违反错误: {}", message);
        return Result.validateFailed(message);
    }

    /**
     * 处理数据库完整性约束违反异常
     */
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public Result<Object> handleDataIntegrityViolationException(org.springframework.dao.DataIntegrityViolationException e) {
        log.error("数据完整性约束违反: {}", e.getMessage());

        // 处理外键约束错误
        if (e.getMessage() != null && e.getMessage().contains("foreign key constraint fails")) {
            if (e.getMessage().contains("orders") && e.getMessage().contains("fk_orders_schedule")) {
                return Result.fail(ResultCode.FAILED.getCode(),
                    "该场次已有关联订单，不能直接删除！请先处理相关订单或将场次设置为已取消状态。");
            }
            return Result.fail(ResultCode.FAILED.getCode(), "该数据有关联数据，不能直接删除");
        }

        // 处理唯一约束错误
        if (e.getMessage() != null && e.getMessage().contains("Duplicate entry")) {
            return Result.fail(ResultCode.FAILED.getCode(), "数据已存在，请勿重复添加");
        }

        return Result.fail(ResultCode.FAILED.getCode(), "数据操作失败，可能违反了数据库约束");
    }

    /**
     * 处理未知异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<?> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return Result.fail(500, "系统内部错误，请联系管理员");
    }
}
