package com.cinema.booking.mapper;

import com.cinema.booking.model.entity.SystemLog;
import com.cinema.booking.model.query.SystemLogQuery;
import org.apache.ibatis.annotations.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 系统日志数据访问层
 */
@Mapper
public interface SystemLogMapper {

    /**
     * 插入系统日志
     */
    @Insert("INSERT INTO system_logs(user_id, username, module, operation, description, request_method, " +
            "request_url, request_params, ip_address, status, error_message, execution_time, created_at) " +
            "VALUES(#{userId}, #{username}, #{module}, #{operation}, #{description}, #{requestMethod}, " +
            "#{requestUrl}, #{requestParams}, #{ipAddress}, #{status}, #{errorMessage}, #{executionTime}, " +
            "#{createdAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(SystemLog log);

    /**
     * 查询系统日志列表
     */
    @Select("<script>" +
            "SELECT * FROM system_logs " +
            "WHERE 1=1 " +
            "<if test='username != null and username != \"\"'>" +
            "  AND username LIKE CONCAT('%', #{username}, '%') " +
            "</if>" +
            "<if test='module != null and module != \"\"'>" +
            "  AND module = #{module} " +
            "</if>" +
            "<if test='operation != null and operation != \"\"'>" +
            "  AND operation = #{operation} " +
            "</if>" +
            "<if test='status != null'>" +
            "  AND status = #{status} " +
            "</if>" +
            "<if test='startTime != null'>" +
            "  AND created_at &gt;= #{startTime} " +
            "</if>" +
            "<if test='endTime != null'>" +
            "  AND created_at &lt;= #{endTime} " +
            "</if>" +
            "ORDER BY created_at DESC " +
            "</script>")
    List<SystemLog> selectList(SystemLogQuery query);

    /**
     * 根据ID查询系统日志
     */
    @Select("SELECT * FROM system_logs WHERE id = #{id}")
    SystemLog selectById(Long id);

    /**
     * 根据ID删除系统日志
     */
    @Delete("DELETE FROM system_logs WHERE id = #{id}")
    int deleteById(Long id);

    /**
     * 批量删除系统日志
     */
    @Delete("<script>" +
            "DELETE FROM system_logs WHERE id IN " +
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>" +
            "  #{id}" +
            "</foreach>" +
            "</script>")
    int batchDelete(@Param("ids") List<Long> ids);

    /**
     * 清空系统日志
     */
    @Delete("DELETE FROM system_logs WHERE id IS NOT NULL OR id IS NULL")
    int clearAll();

    /**
     * 获取操作类型列表
     */
    @Select("SELECT DISTINCT operation FROM system_logs ORDER BY operation")
    List<String> selectOperationTypes();

    /**
     * 获取模块列表
     */
    @Select("SELECT DISTINCT module FROM system_logs ORDER BY module")
    List<String> selectModules();

    /**
     * 获取按天统计的操作数量
     */
    @Select("<script>" +
            "SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, COUNT(1) as count " +
            "FROM system_logs " +
            "WHERE 1=1 " +
            "<if test='startTime != null'>" +
            "  AND created_at &gt;= #{startTime} " +
            "</if>" +
            "<if test='endTime != null'>" +
            "  AND created_at &lt;= #{endTime} " +
            "</if>" +
            "GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') " +
            "ORDER BY date" +
            "</script>")
    List<Map<String, Object>> selectDailyStats(@Param("startTime") Date startTime, @Param("endTime") Date endTime);

    /**
     * 获取按模块统计的操作数量
     */
    @Select("<script>" +
            "SELECT module, COUNT(1) as count " +
            "FROM system_logs " +
            "WHERE 1=1 " +
            "<if test='startTime != null'>" +
            "  AND created_at &gt;= #{startTime} " +
            "</if>" +
            "<if test='endTime != null'>" +
            "  AND created_at &lt;= #{endTime} " +
            "</if>" +
            "GROUP BY module " +
            "ORDER BY count DESC" +
            "</script>")
    List<Map<String, Object>> selectModuleStats(@Param("startTime") Date startTime, @Param("endTime") Date endTime);

    /**
     * 获取按操作类型统计的操作数量
     */
    @Select("<script>" +
            "SELECT operation, COUNT(1) as count " +
            "FROM system_logs " +
            "WHERE 1=1 " +
            "<if test='startTime != null'>" +
            "  AND created_at &gt;= #{startTime} " +
            "</if>" +
            "<if test='endTime != null'>" +
            "  AND created_at &lt;= #{endTime} " +
            "</if>" +
            "GROUP BY operation " +
            "ORDER BY count DESC" +
            "</script>")
    List<Map<String, Object>> selectOperationStats(@Param("startTime") Date startTime, @Param("endTime") Date endTime);

    /**
     * 获取按状态统计的操作数量
     */
    @Select("<script>" +
            "SELECT status, COUNT(1) as count " +
            "FROM system_logs " +
            "WHERE 1=1 " +
            "<if test='startTime != null'>" +
            "  AND created_at &gt;= #{startTime} " +
            "</if>" +
            "<if test='endTime != null'>" +
            "  AND created_at &lt;= #{endTime} " +
            "</if>" +
            "GROUP BY status" +
            "</script>")
    List<Map<String, Object>> selectStatusStats(@Param("startTime") Date startTime, @Param("endTime") Date endTime);
} 