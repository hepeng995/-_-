package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cinema.booking.entity.Address;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 收货地址Mapper接口
 */
@Mapper
public interface AddressMapper extends BaseMapper<Address> {
    
    /**
     * 根据用户ID查询地址列表
     * @param userId 用户ID
     * @return 地址列表
     */
    List<Address> selectByUserId(@Param("userId") Long userId);
    
    /**
     * 根据ID和用户ID查询地址
     * @param id 地址ID
     * @param userId 用户ID
     * @return 地址信息
     */
    Address selectByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
    
    /**
     * 取消用户的所有默认地址
     * @param userId 用户ID
     * @return 更新行数
     */
    int cancelDefaultByUserId(@Param("userId") Long userId);
    
    /**
     * 设置默认地址
     * @param id 地址ID
     * @param userId 用户ID
     * @return 更新行数
     */
    int setDefaultAddress(@Param("id") Long id, @Param("userId") Long userId);
    
    /**
     * 删除用户地址
     * @param id 地址ID
     * @param userId 用户ID
     * @return 删除行数
     */
    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}
