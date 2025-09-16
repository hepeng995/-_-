package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cinema.booking.dto.*;
import com.cinema.booking.entity.User;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.UserMapper;
import com.cinema.booking.service.UserService;
import com.cinema.booking.utils.BeanCopyUtils;
import com.cinema.booking.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * 用户服务实现类
 */
@Slf4j
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserMapper userMapper, JwtUtils jwtUtils, 
                           AuthenticationManager authenticationManager,
                           PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    // 实现接口要求的方法
    @Override
    public boolean usernameExists(String username) {
        if (username == null || username.isEmpty()) {
            return false;
        }
        
        return userMapper.checkUsernameExists(username) > 0;
    }

    // 实现接口要求的方法
    @Override
    public boolean emailExists(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        
        return userMapper.checkEmailExists(email) > 0;
    }

    // 接口所需的三参数修改密码方法
    @Override
    @Transactional
    public boolean changePassword(String username, String oldPassword, String newPassword) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        
        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new ServiceException("原密码不正确");
        }
        
        // 更新密码
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, user.getId())
                     .set(User::getPassword, passwordEncoder.encode(newPassword))
                     .set(User::getUpdatedAt, LocalDateTime.now());
        
        return update(updateWrapper);
    }

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // 认证用户
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword())
            );
            
            // 保存认证信息到上下文
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // 查询用户
            User user = userMapper.findByUsername(loginRequest.getUsername());
            if (user == null) {
                throw new ServiceException("用户不存在");
            }
            
            // 生成JWT令牌
            String token = jwtUtils.generateToken(loginRequest.getUsername(), user.getRole());
            
            // 构建响应
            return LoginResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .token(token)
                    .role(user.getRole())
                    .avatar(user.getAvatar())
                    .email(user.getEmail())
                    .realName(user.getRealName())
                    .build();
        } catch (AuthenticationException e) {
            throw new ServiceException("用户名或密码错误");
        }
    }

    @Override
    public UserInfoDto getUserInfo(String username) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        
        return UserInfoDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .realName(user.getRealName())
                .role(user.getRole())
                .avatar(user.getAvatar())
                .build();
    }
    
    @Override
    @Transactional
    public Long register(UserRegisterDTO registerDTO) {
        // 验证两次密码是否一致
        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            throw new ServiceException("两次密码输入不一致");
        }
        
        // 检查用户名是否已存在
        if (usernameExists(registerDTO.getUsername())) {
            throw new ServiceException("用户名已存在");
        }
        
        // 检查邮箱是否已存在
        if (emailExists(registerDTO.getEmail())) {
            throw new ServiceException("邮箱已被注册");
        }
        
        // 创建用户对象
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setEmail(registerDTO.getEmail());
        user.setPhoneNumber(registerDTO.getPhoneNumber());
        user.setRealName(registerDTO.getRealName());
        user.setRole("USER"); // 默认注册为普通用户
        user.setEnabled(true);
        user.setLocked(false);
        user.setDeleted(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        // 保存用户
        save(user);
        
        return user.getId();
    }
    
    @Override
    @Transactional
    public boolean updateUserInfo(UserUpdateDTO updateDTO, String currentUsername) {
        // 获取当前用户
        User currentUser = userMapper.findByUsername(currentUsername);
        if (currentUser == null) {
            throw new ServiceException("当前用户不存在");
        }
        
        // 检查是否是本人或管理员
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isSelf = currentUser.getId().equals(updateDTO.getId());
        
        if (!isSelf && !isAdmin) {
            throw new ServiceException("无权修改他人信息");
        }
        
        // 获取要更新的用户
        User user = getById(updateDTO.getId());
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        
        // 检查邮箱是否已被其他用户使用
        if (updateDTO.getEmail() != null && !updateDTO.getEmail().equals(user.getEmail())) {
            User existingUser = userMapper.findByEmail(updateDTO.getEmail());
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                throw new ServiceException("邮箱已被其他用户注册");
            }
        }
        
        // 更新基本信息
        user.setRealName(updateDTO.getRealName());
        user.setEmail(updateDTO.getEmail());
        user.setPhoneNumber(updateDTO.getPhoneNumber());
        user.setAvatar(updateDTO.getAvatar());
        user.setUpdatedAt(LocalDateTime.now());
        
        // 只有管理员可以修改角色和状态
        if (isAdmin) {
            if (updateDTO.getRole() != null) {
                user.setRole(updateDTO.getRole());
            }
            if (updateDTO.getEnabled() != null) {
                user.setEnabled(updateDTO.getEnabled());
            }
        }
        
        return updateById(user);
    }
    
    /**
     * 该方法已由接口中的changePassword替代，保留此方法是为了支持旧代码
     */
    @Transactional
    public boolean updatePassword(UserUpdateDTO updateDTO, String currentUsername) {
        // 获取当前用户
        User currentUser = userMapper.findByUsername(currentUsername);
        if (currentUser == null) {
            throw new ServiceException("当前用户不存在");
        }
        
        // 检查是否是本人或管理员
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isSelf = currentUser.getId().equals(updateDTO.getId());
        
        if (!isSelf && !isAdmin) {
            throw new ServiceException("无权修改他人密码");
        }
        
        // 获取要更新的用户
        User user = getById(updateDTO.getId());
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        
        // 验证旧密码（非管理员必须验证）
        if (isSelf && !isAdmin) {
            if (updateDTO.getOldPassword() == null || updateDTO.getOldPassword().isEmpty()) {
                throw new ServiceException("旧密码不能为空");
            }
            
            if (!passwordEncoder.matches(updateDTO.getOldPassword(), user.getPassword())) {
                throw new ServiceException("旧密码不正确");
            }
        }
        
        // 验证新密码
        if (updateDTO.getNewPassword() == null || updateDTO.getNewPassword().isEmpty()) {
            throw new ServiceException("新密码不能为空");
        }
        
        if (updateDTO.getNewPassword().length() < 6 || updateDTO.getNewPassword().length() > 20) {
            throw new ServiceException("密码长度必须在6-20之间");
        }
        
        if (!updateDTO.getNewPassword().equals(updateDTO.getConfirmPassword())) {
            throw new ServiceException("两次密码输入不一致");
        }
        
        // 更新密码
        user.setPassword(passwordEncoder.encode(updateDTO.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        
        return updateById(user);
    }
    
    @Override
    @Transactional
    public boolean addUser(UserDTO userDTO) {
        // 检查用户名是否存在
        if (usernameExists(userDTO.getUsername())) {
            throw new ServiceException("用户名已存在");
        }
        
        // 检查邮箱是否存在
        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty() && emailExists(userDTO.getEmail())) {
            throw new ServiceException("邮箱已存在");
        }
        
        // 创建用户实体
        User user = new User();
        BeanUtils.copyProperties(userDTO, user);
        
        // 加密密码
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        
        // 如果未指定角色，则默认为普通用户
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        
        // 如果未指定状态，则默认为启用
        if (user.getEnabled() == null) {
            user.setEnabled(true);
        }
        
        // 设置创建时间
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setDeleted(false);
        
        // 保存用户
        return save(user);
    }
    
    @Override
    @Transactional
    public boolean updateUser(UserDTO userDTO) {
        // 检查用户是否存在
        User existingUser = getById(userDTO.getId());
        if (existingUser == null || existingUser.getDeleted()) {
            throw new ServiceException("用户不存在");
        }
        
        // 检查邮箱是否被其他用户使用
        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {
            User userWithEmail = userMapper.findByEmail(userDTO.getEmail());
            if (userWithEmail != null && !userWithEmail.getId().equals(userDTO.getId())) {
                throw new ServiceException("邮箱已被其他用户使用");
            }
        }
        
        // 更新用户信息
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, userDTO.getId());
        
        // 更新字段（如果有值）
        if (userDTO.getRealName() != null) {
            updateWrapper.set(User::getRealName, userDTO.getRealName());
        }
        
        if (userDTO.getEmail() != null) {
            updateWrapper.set(User::getEmail, userDTO.getEmail());
        }
        
        if (userDTO.getPhoneNumber() != null) {
            updateWrapper.set(User::getPhoneNumber, userDTO.getPhoneNumber());
        }
        
        if (userDTO.getAvatar() != null) {
            updateWrapper.set(User::getAvatar, userDTO.getAvatar());
        }
        
        if (userDTO.getRole() != null) {
            updateWrapper.set(User::getRole, userDTO.getRole());
        }
        
        if (userDTO.getEnabled() != null) {
            updateWrapper.set(User::getEnabled, userDTO.getEnabled());
        }
        
        // 如果有新密码，则加密后更新
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            updateWrapper.set(User::getPassword, passwordEncoder.encode(userDTO.getPassword()));
        }
        
        updateWrapper.set(User::getUpdatedAt, LocalDateTime.now());
        
        return update(updateWrapper);
    }
    
    @Override
    @Transactional
    public boolean updateUserStatus(Long id, Boolean enabled) {
        if (id == null || enabled == null) {
            throw new ServiceException("参数不完整");
        }
        
        User user = getById(id);
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        
        // 更新状态
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, id)
                     .set(User::getEnabled, enabled)
                     .set(User::getUpdatedAt, LocalDateTime.now());
        
        return update(updateWrapper);
    }
    
    @Override
    @Transactional
    public boolean resetPassword(Long id) {
        User user = getById(id);
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        
        // 使用固定密码123456替代随机密码
        String newPassword = "123456";
        
        // 更新密码
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, id)
                     .set(User::getPassword, passwordEncoder.encode(newPassword))
                     .set(User::getUpdatedAt, LocalDateTime.now());
        
        return update(updateWrapper);
    }
    
    @Override
    @Transactional
    public boolean deleteUser(Long id) {
        User user = getById(id);
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        
        // 逻辑删除
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, id)
                     .set(User::getDeleted, true)
                     .set(User::getUpdatedAt, LocalDateTime.now());
        
        return update(updateWrapper);
    }
    
    /**
     * 为了兼容性保留的方法，委托给usernameExists实现
     */
    public boolean checkUsernameExists(String username) {
        return usernameExists(username);
    }
    
    /**
     * 为了兼容性保留的方法，委托给emailExists实现
     */
    public boolean checkEmailExists(String email) {
        return emailExists(email);
    }
    
    @Override
    public Map<String, Long> countUsersByRole() {
        List<Object[]> countList = userMapper.countUsersByRole();
        Map<String, Long> countMap = new HashMap<>();
        
        for (Object[] obj : countList) {
            if (obj.length >= 2) {
                String role = (String) obj[0];
                Long count = Long.valueOf(obj[1].toString());
                countMap.put(role, count);
            }
        }
        
        return countMap;
    }
    
    /**
     * 生成随机密码
     */
    private String generateRandomPassword(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        Random random = new Random();
        
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characters.length());
            password.append(characters.charAt(index));
        }
        
        return password.toString();
    }

    /**
     * 获取当前登录用户信息
     */
    @Override
    public UserDTO getCurrentUserInfo() {
        // 获取当前认证信息
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // 查询用户
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        
        // 转换为DTO
        UserDTO userDTO = new UserDTO();
        BeanUtils.copyProperties(user, userDTO);
        
        return userDTO;
    }
    
    /**
     * 根据ID获取用户信息
     */
    @Override
    public UserDTO getUserById(Long id) {
        User user = getById(id);
        if (user == null || user.getDeleted()) {
            throw new ServiceException("用户不存在");
        }
        
        UserDTO userDTO = new UserDTO();
        BeanUtils.copyProperties(user, userDTO);
        
        return userDTO;
    }
    
    /**
     * 更新个人资料
     */
    @Override
    @Transactional
    public boolean updateProfile(UserDTO userDTO) {
        // 获取当前用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        
        // 只允许更新个人资料相关字段
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, user.getId());
        
        if (userDTO.getRealName() != null) {
            updateWrapper.set(User::getRealName, userDTO.getRealName());
        }
        
        if (userDTO.getEmail() != null) {
            // 检查邮箱是否被其他用户使用
            User existingUser = userMapper.findByEmail(userDTO.getEmail());
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                throw new ServiceException("邮箱已被其他用户使用");
            }
            updateWrapper.set(User::getEmail, userDTO.getEmail());
        }
        
        if (userDTO.getPhoneNumber() != null) {
            updateWrapper.set(User::getPhoneNumber, userDTO.getPhoneNumber());
        }
        
        if (userDTO.getAvatar() != null) {
            updateWrapper.set(User::getAvatar, userDTO.getAvatar());
        }
        
        updateWrapper.set(User::getUpdatedAt, LocalDateTime.now());
        
        return update(updateWrapper);
    }
    
    /**
     * 获取用户统计信息
     */
    @Override
    public Map<String, Object> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 获取各角色用户数量
        Map<String, Long> roleCounts = countUsersByRole();
        stats.put("roleCounts", roleCounts);
        
        // 计算总用户数
        long totalUsers = roleCounts.values().stream().mapToLong(Long::longValue).sum();
        stats.put("totalUsers", totalUsers);
        
        // 最近注册用户数（7天内）
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.ge(User::getCreatedAt, sevenDaysAgo)
                   .eq(User::getDeleted, false);
        long recentUsers = count(queryWrapper);
        stats.put("recentUsers", recentUsers);
        
        return stats;
    }

    /**
     * 分页查询用户列表
     */
    @Override
    public IPage<UserDTO> pageUsers(UserQueryDTO queryDTO) {
        Page<User> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        
        // 设置查询条件
        if (queryDTO.getUsername() != null && !queryDTO.getUsername().isEmpty()) {
            queryWrapper.like(User::getUsername, queryDTO.getUsername());
        }
        
        if (queryDTO.getEmail() != null && !queryDTO.getEmail().isEmpty()) {
            queryWrapper.like(User::getEmail, queryDTO.getEmail());
        }
        
        if (queryDTO.getPhoneNumber() != null && !queryDTO.getPhoneNumber().isEmpty()) {
            queryWrapper.like(User::getPhoneNumber, queryDTO.getPhoneNumber());
        }
        
        if (queryDTO.getRealName() != null && !queryDTO.getRealName().isEmpty()) {
            queryWrapper.like(User::getRealName, queryDTO.getRealName());
        }
        
        if (queryDTO.getRole() != null && !queryDTO.getRole().isEmpty()) {
            queryWrapper.eq(User::getRole, queryDTO.getRole());
        }
        
        if (queryDTO.getEnabled() != null) {
            queryWrapper.eq(User::getEnabled, queryDTO.getEnabled());
        }
        
        // 不查询已删除的用户
        queryWrapper.eq(User::getDeleted, false);
        
        // 排序
        queryWrapper.orderByDesc(User::getCreatedAt);
        
        // 查询
        IPage<User> userPage = page(page, queryWrapper);
        
        // 转换为DTO
        IPage<UserDTO> dtoPage = userPage.convert(user -> {
            UserDTO dto = new UserDTO();
            BeanUtils.copyProperties(user, dto);
            // 安全起见，不返回密码
            dto.setPassword(null);
            return dto;
        });
        
        return dtoPage;
    }

    @Override
    public UserDTO getUserByUsername(String username) {
        User user = lambdaQuery()
                .eq(User::getUsername, username)
                .eq(User::getDeleted, false)
                .one();
        return user != null ? BeanCopyUtils.copyProperties(user, UserDTO.class) : null;
    }

    @Override
    public Object getUserPage(Integer current, Integer size, String username, String email, String phoneNumber, String role, Boolean enabled) {
        Page<User> page = new Page<>(current, size);
        
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getDeleted, false);
        
        // 添加各种查询条件
        if (username != null && !username.isEmpty()) {
            queryWrapper.like(User::getUsername, username);
        }
        if (email != null && !email.isEmpty()) {
            queryWrapper.like(User::getEmail, email);
        }
        if (phoneNumber != null && !phoneNumber.isEmpty()) {
            queryWrapper.like(User::getPhoneNumber, phoneNumber);
        }
        if (role != null && !role.isEmpty()) {
            queryWrapper.eq(User::getRole, role);
        }
        if (enabled != null) {
            queryWrapper.eq(User::getEnabled, enabled);
        }
        
        // 排序
        queryWrapper.orderByDesc(User::getCreatedAt);
        
        // 查询
        Page<User> userPage = page(page, queryWrapper);
        
        // 转换结果
        Page<UserDTO> resultPage = new Page<>();
        BeanUtils.copyProperties(userPage, resultPage, "records");
        
        // 转换记录，修正参数
        resultPage.setRecords(BeanCopyUtils.copyListProperties(userPage.getRecords(), UserDTO.class));
        
        Map<String, Object> result = new HashMap<>();
        result.put("records", resultPage.getRecords());
        result.put("total", resultPage.getTotal());
        result.put("pages", resultPage.getPages());
        result.put("current", resultPage.getCurrent());
        result.put("size", resultPage.getSize());
        
        return result;
    }
} 