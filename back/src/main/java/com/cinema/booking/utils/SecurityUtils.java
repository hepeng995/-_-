package com.cinema.booking.utils;

import com.cinema.booking.entity.User;
import com.cinema.booking.mapper.UserMapper;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * 安全工具类
 */
@Component
public class SecurityUtils implements ApplicationContextAware {
    
    private static ApplicationContext applicationContext;
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        SecurityUtils.applicationContext = applicationContext;
    }
    
    /**
     * 获取当前登录用户名
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getName())) {
            return authentication.getName();
        }
        return null;
    }
    
    /**
     * 获取当前登录用户ID
     */
    public static Long getCurrentUserId() {
        String username = getCurrentUsername();
        if (username == null) {
            return null;
        }
        
        try {
            UserMapper userMapper = applicationContext.getBean(UserMapper.class);
            User user = userMapper.findByUsername(username);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 获取当前登录用户信息
     */
    public static User getCurrentUser() {
        String username = getCurrentUsername();
        if (username == null) {
            return null;
        }
        
        try {
            UserMapper userMapper = applicationContext.getBean(UserMapper.class);
            return userMapper.findByUsername(username);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 检查当前用户是否为管理员
     */
    public static boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }
    
    /**
     * 检查当前用户是否有指定角色
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role) || auth.getAuthority().equals(role));
    }
    
    /**
     * 检查当前用户是否为指定用户
     */
    public static boolean isCurrentUser(Long userId) {
        if (userId == null) {
            return false;
        }
        
        Long currentUserId = getCurrentUserId();
        return userId.equals(currentUserId);
    }
}
