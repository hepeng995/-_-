package com.cinema.booking.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * 为每个 HTTP 请求注入 traceId 到 MDC。
 * 优先沿用网关/客户端传入的 X-Trace-Id；否则生成 UUID（去掉短横线）。
 * 同时把 traceId 写回响应头，便于前端打日志关联。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class TraceIdFilter extends OncePerRequestFilter {

    public static final String MDC_KEY = "traceId";
    public static final String HEADER_NAME = "X-Trace-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String traceId = request.getHeader(HEADER_NAME);
        if (traceId == null || traceId.isBlank() || traceId.length() > 64) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }
        MDC.put(MDC_KEY, traceId);
        try {
            response.setHeader(HEADER_NAME, traceId);
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}
