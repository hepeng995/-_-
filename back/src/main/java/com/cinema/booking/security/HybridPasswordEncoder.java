package com.cinema.booking.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 混合密码编码器：
 * - 编码统一使用 BCrypt（强度 10）
 * - 校验时若密文以 BCrypt 前缀（$2a$/$2b$/$2y$）开头，走 BCrypt 校验
 * - 否则按明文兜底比对（兼容历史明文密码），登录成功后由 Service 层异步升级为 BCrypt
 *
 * 仅用于过渡期；存量明文密码迁移完成后可移除明文兜底分支。
 */
@Slf4j
public class HybridPasswordEncoder implements PasswordEncoder {

    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(10);

    @Override
    public String encode(CharSequence rawPassword) {
        return bcrypt.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null || encodedPassword.isEmpty()) {
            return false;
        }
        if (isBcrypt(encodedPassword)) {
            return bcrypt.matches(rawPassword, encodedPassword);
        }
        boolean ok = constantTimeEquals(rawPassword.toString(), encodedPassword);
        if (ok) {
            log.warn("Legacy plaintext password matched; should be upgraded to BCrypt on next login.");
        }
        return ok;
    }

    public boolean isBcrypt(String encodedPassword) {
        return encodedPassword != null
                && (encodedPassword.startsWith("$2a$")
                || encodedPassword.startsWith("$2b$")
                || encodedPassword.startsWith("$2y$"));
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int diff = 0;
        for (int i = 0; i < a.length(); i++) {
            diff |= a.charAt(i) ^ b.charAt(i);
        }
        return diff == 0;
    }
}
