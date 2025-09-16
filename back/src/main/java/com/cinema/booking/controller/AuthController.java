package com.cinema.booking.controller;

import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.LoginRequest;
import com.cinema.booking.dto.LoginResponse;
import com.cinema.booking.dto.UserInfoDto;
import com.cinema.booking.dto.UserRegisterDTO;
import com.cinema.booking.service.UserService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@Tag(name = "认证管理", description = "认证相关接口")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 用户登录
     */
    @Operation(summary = "用户登录")
    @SystemOperation(module = "用户认证", operation = "用户登录", description = "用户登录系统")
    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = userService.login(loginRequest);
        return Result.success(response);
    }

    /**
     * 用户注册
     */
    @Operation(summary = "用户注册")
    @SystemOperation(module = "用户认证", operation = "用户注册", description = "新用户注册账号")
    @PostMapping("/register")
    public Result<Long> register(@RequestBody UserRegisterDTO registerDTO) {
        Long userId = userService.register(registerDTO);
        return Result.success(userId);
    }

    /**
     * 获取当前用户信息
     */
    @Operation(summary = "获取当前用户信息")
    @GetMapping("/user/info")
    public Result<UserInfoDto> getUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserInfoDto userInfoDto = userService.getUserInfo(username);
        return Result.success(userInfoDto);
    }

    /**
     * 用户注销
     */
    @Operation(summary = "用户注销")
    @SystemOperation(module = "用户认证", operation = "用户登出", description = "用户退出系统")
    @PostMapping("/logout")
    public Result<Boolean> logout() {
        // Spring Security会处理登出，这里只需返回成功
        return Result.success(true);
    }
} 