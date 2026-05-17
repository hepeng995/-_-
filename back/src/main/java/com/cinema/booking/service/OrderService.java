package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.OrderDTO;
import com.cinema.booking.dto.OrderItemDTO;
import com.cinema.booking.dto.PageRequest;

import java.util.List;

/**
 * 订单服务接口
 */
public interface OrderService {
    
    /**
     * 分页查询订单列表
     * @param pageRequest 分页请求参数
     * @param userId 用户ID
     * @param orderStatus 订单状态
     * @param paymentStatus 支付状态
     * @param keyword 关键词
     * @return 订单分页列表
     */
    IPage<OrderDTO> getOrderPage(PageRequest pageRequest, Long userId, Integer orderStatus, Integer paymentStatus, String keyword);
    
    /**
     * 分页查询订单列表（支持字符串状态）
     * @param pageRequest 分页请求参数
     * @param userId 用户ID
     * @param orderStatus 订单状态
     * @param paymentStatus 支付状态
     * @param keyword 关键词
     * @param status 字符串状态
     * @return 订单分页列表
     */
    IPage<OrderDTO> getOrderPage(PageRequest pageRequest, Long userId, Integer orderStatus, Integer paymentStatus, String keyword, String status);
    
    /**
     * 根据ID获取订单详情
     * @param id 订单ID
     * @return 订单详情
     */
    OrderDTO getOrderById(Long id);
    
    /**
     * 根据订单号获取订单详情
     * @param orderNo 订单号
     * @return 订单详情
     */
    OrderDTO getOrderByOrderNo(String orderNo);
    
    /**
     * 创建订单
     * @param orderDTO 订单信息
     * @return 创建的订单信息
     */
    OrderDTO createOrder(OrderDTO orderDTO);
    
    /**
     * 从购物车创建订单
     * @param userId 用户ID
     * @param productIds 商品ID列表
     * @param orderDTO 订单信息
     * @return 创建的订单信息
     */
    OrderDTO createOrderFromCart(Long userId, List<Long> productIds, OrderDTO orderDTO);
    
    /**
     * 从购物车创建订单 (旧方法，保留兼容性)
     * @param userId 用户ID
     * @param productIds 商品ID列表
     * @param deliveryAddress 收货地址
     * @param deliveryName 收货人姓名
     * @param deliveryPhone 收货人电话
     * @param remark 订单备注
     * @return 创建的订单信息
     * @deprecated 使用新的方法 {@link #createOrderFromCart(Long, List, OrderDTO)}
     */
    @Deprecated
    default OrderDTO createOrderFromCart(Long userId, List<Long> productIds, String deliveryAddress, String deliveryName, String deliveryPhone, String remark) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setDeliveryAddress(deliveryAddress);
        orderDTO.setDeliveryName(deliveryName);
        orderDTO.setDeliveryPhone(deliveryPhone);
        orderDTO.setRemark(remark);
        return createOrderFromCart(userId, productIds, orderDTO);
    }
    
    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param orderStatus 订单状态
     * @return 更新后的订单信息
     */
    OrderDTO updateOrderStatus(Long orderId, Integer orderStatus);
    
    /**
     * 更新支付状态
     * @param orderId 订单ID
     * @param paymentStatus 支付状态
     * @return 更新后的订单信息
     */
    OrderDTO updatePaymentStatus(Long orderId, Integer paymentStatus);
    
    /**
     * 取消订单
     * @param orderId 订单ID
     * @param cancelReason 取消原因
     * @return 更新后的订单信息
     */
    OrderDTO cancelOrder(Long orderId, String cancelReason);

    /**
     * 订单退款（仅管理员）
     * 适用场景：订单已支付（订单状态 2/3/4）需要全额退款
     * - 订单状态置为 6（已退款）
     * - 支付状态置为 2（退款）
     * - 恢复商品库存与销量
     *
     * @param orderId      订单ID
     * @param refundReason 退款原因
     * @return 更新后的订单信息
     */
    OrderDTO refundOrder(Long orderId, String refundReason);

    /**
     * 发货（仅管理员）
     * 仅允许从待发货（订单状态 2）流转到已发货（订单状态 3），同时写入发货时间
     *
     * @param orderId      订单ID
     * @param trackingInfo 物流单号或备注（可选）
     * @return 更新后的订单信息
     */
    OrderDTO shipOrder(Long orderId, String trackingInfo);
    
    /**
     * 确认收货
     * @param orderId 订单ID
     * @return 更新后的订单信息
     */
    OrderDTO confirmReceived(Long orderId);
    
    /**
     * 模拟支付
     * @param orderNo 订单号
     * @param paymentMethod 支付方式
     * @return 支付结果
     */
    boolean simulatePayment(String orderNo, String paymentMethod);
    
    /**
     * 获取用户订单统计
     * @param userId 用户ID
     * @return 订单统计信息
     */
    OrderStatisticsDTO getUserOrderStatistics(Long userId);
    
    /**
     * 获取订单统计（管理员）
     * @return 订单统计信息
     */
    OrderStatsDTO getOrderStats();
    
    /**
     * 处理超时未支付订单
     */
    void handleTimeoutOrders();
    
    /**
     * 获取商品信息用于订单确认
     * @param productId 商品ID
     * @param quantity 数量
     * @param specification 规格
     * @return 订单项信息
     */
    OrderItemDTO getProductForOrder(Long productId, Integer quantity, String specification);
    
    /**
     * 获取购物车商品用于订单确认
     * @param userId 用户ID
     * @param itemIds 购物车项ID列表
     * @return 订单项列表
     */
    List<OrderItemDTO> getCartItemsForOrder(Long userId, List<Long> itemIds);

    /**
     * 批量更新订单状态（同时写入对应时间字段）
     */
    int batchUpdateOrderStatus(List<Long> ids, Integer orderStatus);

    /**
     * 批量取消订单
     */
    int batchCancelOrders(List<Long> ids, String cancelReason);

    /**
     * 逻辑删除订单（管理员）
     */
    void deleteOrder(Long orderId);
    
    /**
     * 订单统计DTO
     */
    class OrderStatisticsDTO {
        private Integer totalOrders;
        private Integer pendingPayment;
        private Integer pendingDelivery;
        private Integer pendingReceive;
        private Integer completed;
        private Integer cancelled;
        
        // getters and setters
        public Integer getTotalOrders() { return totalOrders; }
        public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
        
        public Integer getPendingPayment() { return pendingPayment; }
        public void setPendingPayment(Integer pendingPayment) { this.pendingPayment = pendingPayment; }
        
        public Integer getPendingDelivery() { return pendingDelivery; }
        public void setPendingDelivery(Integer pendingDelivery) { this.pendingDelivery = pendingDelivery; }
        
        public Integer getPendingReceive() { return pendingReceive; }
        public void setPendingReceive(Integer pendingReceive) { this.pendingReceive = pendingReceive; }
        
        public Integer getCompleted() { return completed; }
        public void setCompleted(Integer completed) { this.completed = completed; }
        
        public Integer getCancelled() { return cancelled; }
        public void setCancelled(Integer cancelled) { this.cancelled = cancelled; }
    }
    
    /**
     * 管理员订单统计DTO
     */
    class OrderStatsDTO {
        private Integer totalOrders;
        private java.util.List<StatusStatDTO> statusStats;
        private java.math.BigDecimal totalAmount;
        private java.math.BigDecimal todayAmount;
        private Integer todayOrders;
        
        // getters and setters
        public Integer getTotalOrders() { return totalOrders; }
        public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
        
        public java.util.List<StatusStatDTO> getStatusStats() { return statusStats; }
        public void setStatusStats(java.util.List<StatusStatDTO> statusStats) { this.statusStats = statusStats; }
        
        public java.math.BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(java.math.BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public java.math.BigDecimal getTodayAmount() { return todayAmount; }
        public void setTodayAmount(java.math.BigDecimal todayAmount) { this.todayAmount = todayAmount; }
        
        public Integer getTodayOrders() { return todayOrders; }
        public void setTodayOrders(Integer todayOrders) { this.todayOrders = todayOrders; }
    }
    
    /**
     * 状态统计DTO
     */
    class StatusStatDTO {
        private String status;
        private String name;
        private Integer count;
        private Integer percentage;
        private String color;
        
        public StatusStatDTO() {}
        
        public StatusStatDTO(String status, String name, Integer count, Integer percentage, String color) {
            this.status = status;
            this.name = name;
            this.count = count;
            this.percentage = percentage;
            this.color = color;
        }
        
        // getters and setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public Integer getCount() { return count; }
        public void setCount(Integer count) { this.count = count; }
        
        public Integer getPercentage() { return percentage; }
        public void setPercentage(Integer percentage) { this.percentage = percentage; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }

    
}
