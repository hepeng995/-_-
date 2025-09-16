package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 订单Mapper接口
 */
@Mapper
public interface OrderMapper extends BaseMapper<Order> {
    
    /**
     * 分页查询订单列表
     * @param page 分页参数
     * @param userId 用户ID
     * @param orderStatus 订单状态
     * @param paymentStatus 支付状态
     * @param keyword 关键词（订单号）
     * @return 订单分页列表
     */
    IPage<Order> selectOrderPage(Page<Order> page, 
                               @Param("userId") Long userId,
                               @Param("orderStatus") Integer orderStatus,
                               @Param("paymentStatus") Integer paymentStatus,
                               @Param("keyword") String keyword);
    
    /**
     * 根据用户ID查询订单列表
     * @param userId 用户ID
     * @return 订单列表
     */
    List<Order> selectByUserId(@Param("userId") Long userId);
    
    /**
     * 根据订单号查询订单
     * @param orderNo 订单号
     * @return 订单信息
     */
    Order selectByOrderNo(@Param("orderNo") String orderNo);
    
    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param orderStatus 订单状态
     * @return 更新行数
     */
    int updateOrderStatus(@Param("orderId") Long orderId, @Param("orderStatus") Integer orderStatus);
    
    /**
     * 更新支付状态
     * @param orderId 订单ID
     * @param paymentStatus 支付状态
     * @return 更新行数
     */
    int updatePaymentStatus(@Param("orderId") Long orderId, @Param("paymentStatus") Integer paymentStatus);
    
    /**
     * 查询待支付超时订单
     * @param timeoutMinutes 超时分钟数
     * @return 超时订单列表
     */
    List<Order> selectTimeoutOrders(@Param("timeoutMinutes") Integer timeoutMinutes);
}
