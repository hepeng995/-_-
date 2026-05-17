package com.cinema.booking.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 基于 Redis 计数的固定窗口限流。
 *
 * 每个 (key, window) 一个 Redis 计数器；超过 {@link #count()} 时直接抛 429。
 * key 默认按 IP+方法 拼接，可配 {@link KeyType#USER} 切换为用户维度。
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

    /** 时间窗口（秒） */
    int window() default 60;

    /** 窗口内最大调用次数 */
    int count() default 30;

    /** 限流粒度：按 IP 或按登录用户 */
    KeyType key() default KeyType.IP;

    /** 触发限流时返回给前端的提示语 */
    String message() default "请求过于频繁，请稍后再试";

    enum KeyType { IP, USER }
}
