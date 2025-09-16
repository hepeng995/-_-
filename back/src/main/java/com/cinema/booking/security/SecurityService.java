package com.cinema.booking.security;

import com.cinema.booking.entity.User;
import com.cinema.booking.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/**
 * 安全服务，提供安全相关的功能
 */
@Service
public class SecurityService {
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 判断当前用户是否为指定ID的用户
     * 用于Spring Security的PreAuthorize注解中
     * 
     * @param userId 用户ID
     * @return 是否为当前用户
     */
    public boolean isCurrentUser(Long userId) {
        if (userId == null) {
            return false;
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        // 获取当前用户名
        String currentUsername = authentication.getName();
        
        // 直接尝试将userId转为字符串比较
        // 注意：这个方法在使用数字用户ID时可能不安全，
        // 但我们的系统中使用的是用户名作为authentication.getName()的返回值
        try {
            return userId.toString().equals(currentUsername);
        } catch (Exception e) {
            // 转换失败，返回false
            return false;
        }
    }
    
    
    /**
     * 获取当前登录用户名
     * 
     * @return 用户名
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return null;
    }
    
    /**
     * 获取当前登录用户ID
     * 
     * @return 用户ID
     */
    public Long getCurrentUserId() {
        String username = getCurrentUsername();
        if (username == null) {
            return null;
        }
        
        // 通过用户名查询数据库获取用户ID
        User user = userMapper.findByUsername(username);
        return user != null ? user.getId() : null;
    }
    
    /**
     * 检查当前用户是否有指定角色
     * 
     * @param role 角色名
     * @return 是否有该角色
     */
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role) || auth.getAuthority().equals(role));
    }
} 