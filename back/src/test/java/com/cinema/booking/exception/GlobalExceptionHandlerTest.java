package com.cinema.booking.exception;

import com.cinema.booking.utils.Result;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void authenticationExceptionKeepsLoginSpecificMessage() {
        Result<?> result = handler.handleAuthenticationException(new BadCredentialsException("bad credentials"));
        assertEquals(401, result.getCode());
        assertEquals("用户名或密码错误", result.getMessage());
    }

    @Test
    void genericRuntimeExceptionDoesNotBecomeAiBusyMessage() {
        Result<?> result = handler.handleException(new RuntimeException("boom"));
        assertEquals(500, result.getCode());
        assertEquals("系统内部错误，请联系管理员", result.getMessage());
    }
}
