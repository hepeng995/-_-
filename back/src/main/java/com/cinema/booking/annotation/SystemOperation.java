package com.cinema.booking.annotation;

import java.lang.annotation.*;

/**
 * 系统操作日志注解
 * 用于标记需要记录系统日志的方法
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface SystemOperation {

    /**
     * 模块名称
     */
    String module() default "";

    /**
     * 操作类型
     */
    String operation() default "";

    /**
     * 操作描述
     */
    String description() default "";
} 