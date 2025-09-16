package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 根据用户名查找用户
     */
    @Select("SELECT * FROM users WHERE username = #{username} AND deleted = 0")
    User findByUsername(@Param("username") String username);
    
    /**
     * 根据邮箱查找用户
     */
    @Select("SELECT * FROM users WHERE email = #{email} AND deleted = 0")
    User findByEmail(@Param("email") String email);
    
    /**
     * 分页查询用户列表
     */
    @Select("<script>" +
            "SELECT * FROM users " +
            "<where> " +
            "<if test='username != null and username != \"\"'> " +
            "  AND username LIKE CONCAT('%', #{username}, '%') " +
            "</if> " +
            "<if test='email != null and email != \"\"'> " +
            "  AND email LIKE CONCAT('%', #{email}, '%') " +
            "</if> " +
            "<if test='phoneNumber != null and phoneNumber != \"\"'> " +
            "  AND phone_number = #{phoneNumber} " +
            "</if> " +
            "<if test='realName != null and realName != \"\"'> " +
            "  AND real_name LIKE CONCAT('%', #{realName}, '%') " +
            "</if> " +
            "<if test='role != null and role != \"\"'> " +
            "  AND role = #{role} " +
            "</if> " +
            "<if test='enabled != null'> " +
            "  AND enabled = #{enabled} " +
            "</if> " +
            "  AND deleted = 0 " +
            "</where> " +
            "ORDER BY created_at DESC" +
            "</script>")
    IPage<User> pageUsers(Page<User> page, 
                        @Param("username") String username,
                        @Param("email") String email,
                        @Param("phoneNumber") String phoneNumber,
                        @Param("realName") String realName,
                        @Param("role") String role,
                        @Param("enabled") Boolean enabled);
    
    /**
     * 根据角色和状态查询用户列表
     */
    @Select("SELECT * FROM users WHERE role = #{role} AND enabled = #{enabled} AND deleted = 0 ORDER BY created_at DESC")
    List<User> findByRoleAndStatus(@Param("role") String role, @Param("enabled") Boolean enabled);
    
    /**
     * 统计用户数量（按角色分组）
     */
    @Select("SELECT role, COUNT(*) as count FROM users WHERE deleted = 0 GROUP BY role")
    List<Object[]> countUsersByRole();
    
    /**
     * 检查用户名是否已存在
     */
    @Select("SELECT COUNT(*) FROM users WHERE username = #{username} AND deleted = 0")
    int checkUsernameExists(@Param("username") String username);
    
    /**
     * 检查邮箱是否已存在
     */
    @Select("SELECT COUNT(*) FROM users WHERE email = #{email} AND deleted = 0")
    int checkEmailExists(@Param("email") String email);
} 