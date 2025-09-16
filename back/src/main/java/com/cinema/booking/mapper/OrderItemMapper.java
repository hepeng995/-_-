package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cinema.booking.entity.OrderItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 订单明细Mapper接口
 */
@Mapper
public interface OrderItemMapper extends BaseMapper<OrderItem> {
    
    /**
     * 根据订单ID查询订单明细列表
     * @param orderId 订单ID
     * @return 订单明细列表
     */
    List<OrderItem> selectByOrderId(@Param("orderId") Long orderId);
    
    /**
     * 根据订单ID删除订单明细
     * @param orderId 订单ID
     * @return 删除行数
     */
    int deleteByOrderId(@Param("orderId") Long orderId);
    
    /**
     * 批量插入订单明细
     * @param orderItems 订单明细列表
     * @return 插入行数
     */
    int batchInsert(@Param("list") List<OrderItem> orderItems);
}
