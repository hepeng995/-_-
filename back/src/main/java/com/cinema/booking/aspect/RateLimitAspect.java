package com.cinema.booking.aspect;

import com.cinema.booking.annotation.RateLimit;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.Duration;

/**
 * 限流切面：使用 Redis INCR + EXPIRE 实现固定窗口计数。
 *
 * - 第一次进入窗口时设置 TTL，后续请求只 INCR
 * - 超过阈值抛 ServiceException(429)，由 GlobalExceptionHandler 转为 429 状态码
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class RateLimitAspect {

    private static final String PREFIX = "ratelimit:";
    private final StringRedisTemplate redis;

    @Around("@annotation(com.cinema.booking.annotation.RateLimit)")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        Method method = signature.getMethod();
        RateLimit rl = method.getAnnotation(RateLimit.class);

        String identity;
        if (rl.key() == RateLimit.KeyType.USER) {
            Long uid = SecurityUtils.getCurrentUserId();
            identity = uid != null ? ("u:" + uid) : ("ip:" + currentIp());
        } else {
            identity = "ip:" + currentIp();
        }
        String redisKey = PREFIX + method.getDeclaringClass().getSimpleName()
                + "." + method.getName() + ":" + identity;

        Long val = redis.opsForValue().increment(redisKey);
        if (val != null && val == 1L) {
            redis.expire(redisKey, Duration.ofSeconds(rl.window()));
        }
        if (val != null && val > rl.count()) {
            log.warn("RateLimit triggered: key={} count={} threshold={}", redisKey, val, rl.count());
            throw new ServiceException(429, rl.message());
        }
        return pjp.proceed();
    }

    private String currentIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return "unknown";
            HttpServletRequest req = attrs.getRequest();
            String xff = req.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                int comma = xff.indexOf(',');
                return comma > 0 ? xff.substring(0, comma).trim() : xff.trim();
            }
            String real = req.getHeader("X-Real-IP");
            if (real != null && !real.isBlank()) return real.trim();
            return req.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
