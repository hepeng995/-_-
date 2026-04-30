package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.*;
import com.cinema.booking.entity.User;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.service.UserService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户控制器
 */
@Tag(name = "用户管理", description = "用户管理相关接口")
@RestController
@RequestMapping("/user")
@CrossOrigin
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 获取当前登录用户信息
     */
    @Operation(summary = "获取当前登录用户信息")
    @GetMapping("/info")
    public Result<UserDTO> getCurrentUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserDTO userDTO = userService.getUserByUsername(username);
        return Result.success(userDTO);
    }

    /**
     * 获取用户详细信息
     */
    @Operation(summary = "获取用户详情")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCurrentUser(#id)")
    public Result<UserDTO> getUserDetail(@PathVariable Long id) {
        UserDTO userDTO = userService.getUserById(id);
        if (userDTO != null) {
            return Result.success(userDTO);
        } else {
            return Result.fail("用户不存在");
        }
    }

    /**
     * 更新用户个人资料
     */
    @Operation(summary = "更新个人资料")
    @SystemOperation(module = "用户管理", operation = "更新个人资料", description = "用户更新个人信息")
    @PutMapping("/profile")
    public Result<Void> updateProfile(@RequestBody UserDTO userDTO) {
        // 获取当前登录用户ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserDTO currentUser = userService.getUserByUsername(username);
        
        if (currentUser == null) {
            return Result.fail("用户不存在");
        }
        
        // 设置当前用户的ID，防止修改其他用户的信息
        userDTO.setId(currentUser.getId());
        
        // 不允许修改关键敏感信息
        userDTO.setUsername(currentUser.getUsername());
        userDTO.setRole(currentUser.getRole());
        userDTO.setEnabled(currentUser.getEnabled());
        
        boolean success = userService.updateUser(userDTO);
        if (success) {
            return Result.success();
        } else {
            return Result.fail("更新个人资料失败");
        }
    }

    /**
     * 更新用户头像
     */
    @Operation(summary = "更新用户头像")
    @SystemOperation(module = "用户管理", operation = "更新头像", description = "用户更新个人头像")
    @PutMapping("/avatar")
    public Result<Void> updateAvatar(@RequestBody Map<String, String> payload) {
        String avatar = payload.get("avatar");
        if (avatar == null || avatar.isBlank()) {
            return Result.fail("头像地址不能为空");
        }

        UserDTO userDTO = new UserDTO();
        userDTO.setAvatar(avatar);
        boolean success = userService.updateProfile(userDTO);
        return success ? Result.success() : Result.fail("更新头像失败");
    }

    /**
     * 修改密码
     */
    @Operation(summary = "修改个人密码")
    @SystemOperation(module = "用户管理", operation = "修改密码", description = "用户修改个人密码")
    @PutMapping("/change-password")
    public Result<Void> changePassword(@RequestBody Map<String, String> passwordMap) {
        String oldPassword = passwordMap.get("oldPassword");
        String newPassword = passwordMap.get("newPassword");
        
        if (oldPassword == null || newPassword == null) {
            return Result.fail("原密码和新密码不能为空");
        }
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            boolean success = userService.changePassword(username, oldPassword, newPassword);
            return Result.success();
        } catch (ServiceException e) {
            return Result.fail(e.getMessage());
        } catch (Exception e) {
            log.error("修改密码发生错误", e);
            return Result.fail("系统错误，请联系管理员");
        }
    }
    
    /**
     * 检查用户名是否已存在
     */
    @Operation(summary = "检查用户名是否已存在")
    @GetMapping("/check-username")
    public Result<Boolean> checkUsername(@RequestParam String username) {
        boolean exists = userService.usernameExists(username);
        return Result.success(exists);
    }
    
    /**
     * 检查邮箱是否已存在
     */
    @Operation(summary = "检查邮箱是否已存在")
    @GetMapping("/check-email")
    public Result<Boolean> checkEmail(@RequestParam String email) {
        boolean exists = userService.emailExists(email);
        return Result.success(exists);
    }
    
    /**
     * 重置用户密码
     */
    @Operation(summary = "重置用户密码")
    @SystemOperation(module = "用户管理", operation = "重置密码", description = "管理员重置用户密码")
    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> resetUserPassword(@PathVariable Long id) {
        boolean success = userService.resetPassword(id);
        if (success) {
            return Result.success();
        } else {
            return Result.fail("重置密码失败");
        }
    }
    
    /**
     * 更新用户状态
     */
    @Operation(summary = "修改用户状态")
    @SystemOperation(module = "用户管理", operation = "修改用户状态", description = "管理员启用/禁用用户账号")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateUserStatus(@PathVariable Long id, @RequestParam Boolean enabled) {
        boolean success = userService.updateUserStatus(id, enabled);
        if (success) {
            return Result.success();
        } else {
            return Result.fail("更新用户状态失败");
        }
    }
    
    /**
     * 分页获取用户列表
     */
    @Operation(summary = "分页查询用户列表")
    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Object> getUserPage(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled) {
        
        Object page = userService.getUserPage(current, size, username, email, phoneNumber, role, enabled);
        return Result.success(page);
    }
    
    /**
     * 添加用户
     */
    @Operation(summary = "新增用户")
    @SystemOperation(module = "用户管理", operation = "新增用户", description = "管理员添加新用户")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> addUser(@RequestBody UserDTO userDTO) {
        boolean success = userService.addUser(userDTO);
        if (success) {
            return Result.success();
        } else {
            return Result.fail("添加用户失败");
        }
    }
    
    /**
     * 更新用户信息
     */
    @Operation(summary = "更新用户")
    @SystemOperation(module = "用户管理", operation = "更新用户", description = "管理员更新用户信息")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        userDTO.setId(id);
        boolean success = userService.updateUser(userDTO);
        if (success) {
            return Result.success();
        } else {
            return Result.fail("更新用户失败");
        }
    }
    
    /**
     * 删除用户
     */
    @Operation(summary = "删除用户")
    @SystemOperation(module = "用户管理", operation = "删除用户", description = "管理员删除用户")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteUser(@PathVariable Long id) {
        boolean success = userService.deleteUser(id);
        if (success) {
            return Result.success();
        } else {
            return Result.fail("删除用户失败");
        }
    }

    /**
     * 获取用户统计信息
     */
    @Operation(summary = "获取用户统计信息")
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = userService.getUserStats();
        return Result.success(stats);
    }
} 
