package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cinema.booking.dto.LoginRequest;
import com.cinema.booking.dto.LoginResponse;
import com.cinema.booking.dto.UserDTO;
import com.cinema.booking.dto.UserInfoDto;
import com.cinema.booking.dto.UserQueryDTO;
import com.cinema.booking.dto.UserRegisterDTO;
import com.cinema.booking.dto.UserUpdateDTO;
import com.cinema.booking.entity.User;

import java.util.List;
import java.util.Map;

/**
 * 用户服务接口
 */
public interface UserService extends IService<User> {
    
    /**
     * 用户登录
     *
     * @param loginRequest 登录请求
     * @return 登录响应
     */
    LoginResponse login(LoginRequest loginRequest);
    
    /**
     * 获取用户信息
     *
     * @param username 用户名
     * @return 用户信息
     */
    UserInfoDto getUserInfo(String username);
    
    /**
     * 根据用户名获取用户信息
     * @param username 用户名
     * @return 用户信息DTO
     */
    UserDTO getUserByUsername(String username);
    
    /**
     * 根据ID获取用户信息
     */
    UserDTO getUserById(Long id);
    
    /**
     * 注册用户
     *
     * @param registerDTO 注册信息
     * @return 用户ID
     */
    Long register(UserRegisterDTO registerDTO);
    
    /**
     * 更新用户基本信息
     *
     * @param updateDTO 更新信息
     * @param currentUsername 当前用户名（用于权限校验）
     * @return 是否成功
     */
    boolean updateUserInfo(UserUpdateDTO updateDTO, String currentUsername);
    
    /**
     * 更新用户信息
     * @param userDTO 用户信息
     * @return 是否成功
     */
    boolean updateUser(UserDTO userDTO);
    
    /**
     * 更新个人资料
     */
    boolean updateProfile(UserDTO userDTO);
    
    /**
     * 修改密码
     * @param username 用户名
     * @param oldPassword 原密码
     * @param newPassword 新密码
     * @return 是否成功
     */
    boolean changePassword(String username, String oldPassword, String newPassword);
    
    /**
     * 分页查询用户列表
     *
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    IPage<UserDTO> pageUsers(UserQueryDTO queryDTO);
    
    /**
     * 分页查询用户
     * @param current 当前页
     * @param size 页面大小
     * @param username 用户名
     * @param email 邮箱
     * @param phoneNumber 手机号
     * @param role 角色
     * @param enabled 状态
     * @return 分页数据
     */
    Object getUserPage(Integer current, Integer size, String username, String email, String phoneNumber, String role, Boolean enabled);
    
    /**
     * 添加用户
     * @param userDTO 用户信息
     * @return 是否成功
     */
    boolean addUser(UserDTO userDTO);
    
    /**
     * 启用/禁用用户
     *
     * @param id 用户ID
     * @param enabled 是否启用
     * @return 是否成功
     */
    boolean updateUserStatus(Long id, Boolean enabled);
    
    /**
     * 重置用户密码
     * @param id 用户ID
     * @return 是否成功
     */
    boolean resetPassword(Long id);
    
    /**
     * 删除用户（逻辑删除）
     *
     * @param id 用户ID
     * @return 是否成功
     */
    boolean deleteUser(Long id);
    
    /**
     * 检查用户名是否存在
     * @param username 用户名
     * @return 是否存在
     */
    boolean usernameExists(String username);
    
    /**
     * 检查邮箱是否存在
     * @param email 邮箱
     * @return 是否存在
     */
    boolean emailExists(String email);
    
    /**
     * 统计用户数量（按角色分组）
     *
     * @return 统计结果
     */
    Map<String, Long> countUsersByRole();

    /**
     * 获取当前登录用户信息
     */
    UserDTO getCurrentUserInfo();

    /**
     * 获取用户统计信息
     */
    Map<String, Object> getUserStats();
} 