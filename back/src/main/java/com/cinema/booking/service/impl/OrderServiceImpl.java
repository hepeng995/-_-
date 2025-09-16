package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.OrderDTO;
import com.cinema.booking.dto.OrderItemDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.entity.*;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.*;
import com.cinema.booking.service.OrderService;
import com.cinema.booking.utils.BeanCopyUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 订单服务实现类
 */
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final ProductMapper productMapper;
    private final ShoppingCartMapper cartMapper;
    
    private static final Map<Integer, String> ORDER_STATUS_MAP = new HashMap<>();
    private static final Map<Integer, String> PAYMENT_STATUS_MAP = new HashMap<>();
    
    static {
        ORDER_STATUS_MAP.put(1, "待支付");
        ORDER_STATUS_MAP.put(2, "待发货");
        ORDER_STATUS_MAP.put(3, "已发货");
        ORDER_STATUS_MAP.put(4, "已收货");
        ORDER_STATUS_MAP.put(5, "已取消");
        ORDER_STATUS_MAP.put(6, "已退款");
        
        PAYMENT_STATUS_MAP.put(0, "待支付");
        PAYMENT_STATUS_MAP.put(1, "已支付");
        PAYMENT_STATUS_MAP.put(2, "支付失败");
    }
    
    @Override
    public IPage<OrderDTO> getOrderPage(PageRequest pageRequest, Long userId, Integer orderStatus, Integer paymentStatus, String keyword) {
        Page<Order> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        IPage<Order> orderPage = orderMapper.selectOrderPage(page, userId, orderStatus, paymentStatus, keyword);
        
        return orderPage.convert(this::convertToDTO);
    }
    
    @Override
    public IPage<OrderDTO> getOrderPage(PageRequest pageRequest, Long userId, Integer orderStatus, Integer paymentStatus, String keyword, String status) {
        // 将字符串状态转换为整数状态
        Integer statusCode = null;
        if (status != null) {
            switch (status) {
                case "PENDING":
                    statusCode = 1; // 待支付
                    break;
                case "PAID":
                    statusCode = 2; // 待发货
                    break;
                case "SHIPPED":
                    statusCode = 3; // 已发货
                    break;
                case "COMPLETED":
                    statusCode = 4; // 已收货
                    break;
                case "CANCELLED":
                    statusCode = 5; // 已取消
                    break;
            }
        }
        
        // 调用原方法
        return getOrderPage(pageRequest, userId, statusCode, paymentStatus, keyword);
    }
    
    @Override
    public OrderDTO getOrderById(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null || order.getDeleted()) {
            throw new ServiceException("订单不存在");
        }
        
        return convertToDTO(order);
    }
    
    @Override
    public OrderDTO getOrderByOrderNo(String orderNo) {
        Order order = orderMapper.selectByOrderNo(orderNo);
        if (order == null || order.getDeleted()) {
            throw new ServiceException("订单不存在");
        }
        
        return convertToDTO(order);
    }
    
    @Override
    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO) {
        // 生成订单号
        String orderNo = generateOrderNo();
        
        // 创建订单
        Order order = BeanCopyUtils.copyBean(orderDTO, Order.class);
        order.setOrderNo(orderNo);
        order.setPaymentStatus(0); // 待支付
        order.setOrderStatus(1); // 待支付
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setDeleted(false);
        
        // 计算订单金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            totalAmount = totalAmount.add(itemDTO.getTotalPrice());
        }
        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(orderDTO.getDiscountAmount() != null ? orderDTO.getDiscountAmount() : BigDecimal.ZERO);
        order.setActualAmount(totalAmount.subtract(order.getDiscountAmount()));
        
        orderMapper.insert(order);
        
        // 创建订单明细
        List<OrderItem> orderItems = orderDTO.getOrderItems().stream().map(itemDTO -> {
            OrderItem item = BeanCopyUtils.copyBean(itemDTO, OrderItem.class);
            item.setOrderId(order.getId());
            item.setCreatedAt(LocalDateTime.now());
            return item;
        }).collect(Collectors.toList());
        
        orderItemMapper.batchInsert(orderItems);
        
        // 更新商品库存和销量
        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            productMapper.updateStock(itemDTO.getProductId(), -itemDTO.getQuantity());
            productMapper.incrementSalesCount(itemDTO.getProductId(), itemDTO.getQuantity());
        }
        
        return convertToDTO(order);
    }
    
    @Override
    @Transactional
    public OrderDTO createOrderFromCart(Long userId, List<Long> productIds, OrderDTO orderDTO) {
        // 获取购物车商品
        List<ShoppingCart> cartItems = cartMapper.selectByUserId(userId);
        List<ShoppingCart> selectedItems = cartItems.stream()
                .filter(item -> productIds.contains(item.getProductId()))
                .collect(Collectors.toList());
        
        if (selectedItems.isEmpty()) {
            throw new ServiceException("请选择要购买的商品");
        }
        
        // 验证商品库存
        List<OrderItemDTO> orderItems = selectedItems.stream().map(cartItem -> {
            Product product = productMapper.selectById(cartItem.getProductId());
            if (product == null || product.getDeleted() || product.getStatus() != 1) {
                throw new ServiceException("商品 " + cartItem.getProductId() + " 不存在或已下架");
            }
            
            if (product.getStock() < cartItem.getQuantity()) {
                throw new ServiceException("商品 " + product.getName() + " 库存不足");
            }
            
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setProductId(product.getId());
            itemDTO.setProductName(product.getName());
            itemDTO.setProductImage(product.getCoverImage());
            itemDTO.setProductPrice(product.getPrice());
            itemDTO.setQuantity(cartItem.getQuantity());
            itemDTO.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            itemDTO.setProductOrigin(product.getOrigin());
            
            return itemDTO;
        }).collect(Collectors.toList());
        
        // 设置订单项
        orderDTO.setUserId(userId);
        orderDTO.setOrderItems(orderItems);
        
        // 创建订单
        OrderDTO createdOrder = createOrder(orderDTO);
        
        // 从购物车移除已购买的商品
        cartMapper.deleteByUserIdAndProductIds(userId, productIds);
        
        return createdOrder;
    }
    
    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, Integer orderStatus) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || order.getDeleted()) {
            throw new ServiceException("订单不存在");
        }
        
        orderMapper.updateOrderStatus(orderId, orderStatus);
        
        // 更新相关时间字段
        Order updateOrder = new Order();
        updateOrder.setId(orderId);
        updateOrder.setUpdatedAt(LocalDateTime.now());
        
        switch (orderStatus) {
            case 3: // 已发货
                updateOrder.setDeliveryTime(LocalDateTime.now());
                break;
            case 4: // 已收货
                updateOrder.setReceivedTime(LocalDateTime.now());
                break;
            case 5: // 已取消
                updateOrder.setCancelledTime(LocalDateTime.now());
                break;
        }
        
        orderMapper.updateById(updateOrder);
        return getOrderById(orderId);
    }
    
    @Override
    @Transactional
    public OrderDTO updatePaymentStatus(Long orderId, Integer paymentStatus) {
        orderMapper.updatePaymentStatus(orderId, paymentStatus);
        
        if (paymentStatus == 1) { // 支付成功，更新订单状态为待发货
            orderMapper.updateOrderStatus(orderId, 2);
        }
        
        return getOrderById(orderId);
    }
    
    @Override
    @Transactional
    public OrderDTO cancelOrder(Long orderId, String cancelReason) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || order.getDeleted()) {
            throw new ServiceException("订单不存在");
        }
        
        if (order.getOrderStatus() != 1) {
            throw new ServiceException("只能取消待支付状态的订单");
        }
        
        // 恢复商品库存
        List<OrderItem> orderItems = orderItemMapper.selectByOrderId(orderId);
        for (OrderItem item : orderItems) {
            productMapper.updateStock(item.getProductId(), item.getQuantity());
            productMapper.incrementSalesCount(item.getProductId(), -item.getQuantity());
        }
        
        // 更新订单状态
        Order updateOrder = new Order();
        updateOrder.setId(orderId);
        updateOrder.setOrderStatus(5); // 已取消
        updateOrder.setCancelReason(cancelReason);
        updateOrder.setCancelledTime(LocalDateTime.now());
        updateOrder.setUpdatedAt(LocalDateTime.now());
        
        orderMapper.updateById(updateOrder);
        return getOrderById(orderId);
    }
    
    @Override
    @Transactional
    public OrderDTO confirmReceived(Long orderId) {
        return updateOrderStatus(orderId, 4); // 已收货
    }
    
    @Override
    @Transactional
    public boolean simulatePayment(String orderNo, String paymentMethod) {
        Order order = orderMapper.selectByOrderNo(orderNo);
        if (order == null || order.getDeleted()) {
            throw new ServiceException("订单不存在");
        }
        
        if (order.getOrderStatus() != 1 || order.getPaymentStatus() != 0) {
            throw new ServiceException("订单状态不正确，无法支付");
        }
        
        // 模拟支付成功
        Order updateOrder = new Order();
        updateOrder.setId(order.getId());
        updateOrder.setPaymentMethod(paymentMethod);
        updateOrder.setPaymentStatus(1); // 已支付
        updateOrder.setOrderStatus(2); // 待发货
        updateOrder.setPaymentTime(LocalDateTime.now());
        updateOrder.setUpdatedAt(LocalDateTime.now());
        
        orderMapper.updateById(updateOrder);
        return true;
    }
    
    @Override
    public OrderStatisticsDTO getUserOrderStatistics(Long userId) {
        List<Order> orders = orderMapper.selectByUserId(userId);
        
        OrderStatisticsDTO statistics = new OrderStatisticsDTO();
        statistics.setTotalOrders(orders.size());
        statistics.setPendingPayment((int) orders.stream().filter(o -> o.getOrderStatus() == 1).count());
        statistics.setPendingDelivery((int) orders.stream().filter(o -> o.getOrderStatus() == 2).count());
        statistics.setPendingReceive((int) orders.stream().filter(o -> o.getOrderStatus() == 3).count());
        statistics.setCompleted((int) orders.stream().filter(o -> o.getOrderStatus() == 4).count());
        statistics.setCancelled((int) orders.stream().filter(o -> o.getOrderStatus() == 5).count());
        
        return statistics;
    }
    
    @Override
    public OrderStatsDTO getOrderStats() {
        // 获取所有订单
        List<Order> allOrders = orderMapper.selectList(
            new QueryWrapper<Order>().eq("deleted", 0)
        );
        
        OrderStatsDTO stats = new OrderStatsDTO();
        stats.setTotalOrders(allOrders.size());
        
        // 计算总金额
        BigDecimal totalAmount = allOrders.stream()
            .filter(o -> o.getPaymentStatus() == 1) // 已支付的订单
            .map(Order::getActualAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalAmount(totalAmount);
        
        // 计算今日订单和金额
        LocalDate today = LocalDate.now();
        List<Order> todayOrders = allOrders.stream()
            .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().equals(today))
            .collect(Collectors.toList());
        
        stats.setTodayOrders(todayOrders.size());
        
        BigDecimal todayAmount = todayOrders.stream()
            .filter(o -> o.getPaymentStatus() == 1)
            .map(Order::getActualAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTodayAmount(todayAmount);
        
        // 统计各状态订单数量
        Map<Integer, Long> statusCounts = allOrders.stream()
            .collect(Collectors.groupingBy(Order::getOrderStatus, Collectors.counting()));
        
        List<StatusStatDTO> statusStats = new ArrayList<>();
        int total = allOrders.size();
        
        // 待付款
        long pendingCount = statusCounts.getOrDefault(1, 0L);
        statusStats.add(new StatusStatDTO("PENDING", "待付款", (int)pendingCount, 
            total > 0 ? (int)Math.round((double)pendingCount / total * 100) : 0, "#f56c6c"));
        
        // 已付款/待发货
        long paidCount = statusCounts.getOrDefault(2, 0L);
        statusStats.add(new StatusStatDTO("PAID", "已付款", (int)paidCount,
            total > 0 ? (int)Math.round((double)paidCount / total * 100) : 0, "#67c23a"));
        
        // 已发货
        long shippedCount = statusCounts.getOrDefault(3, 0L);
        statusStats.add(new StatusStatDTO("SHIPPED", "已发货", (int)shippedCount,
            total > 0 ? (int)Math.round((double)shippedCount / total * 100) : 0, "#409eff"));
        
        // 已完成
        long completedCount = statusCounts.getOrDefault(4, 0L);
        statusStats.add(new StatusStatDTO("COMPLETED", "已完成", (int)completedCount,
            total > 0 ? (int)Math.round((double)completedCount / total * 100) : 0, "#909399"));
        
        // 已取消
        long cancelledCount = statusCounts.getOrDefault(5, 0L);
        statusStats.add(new StatusStatDTO("CANCELLED", "已取消", (int)cancelledCount,
            total > 0 ? (int)Math.round((double)cancelledCount / total * 100) : 0, "#c0c4cc"));
        
        stats.setStatusStats(statusStats);
        
        return stats;
    }
    
    @Override
    @Transactional
    public void handleTimeoutOrders() {
        // 获取超时订单（这里设置为15分钟）
        List<Order> timeoutOrders = orderMapper.selectTimeoutOrders(15);
        
        for (Order order : timeoutOrders) {
            cancelOrder(order.getId(), "订单超时自动取消");
        }
    }
    
    @Override
    public OrderItemDTO getProductForOrder(Long productId, Integer quantity, String specification) {
        // 获取商品信息
        Product product = productMapper.selectById(productId);
        if (product == null || product.getDeleted() || product.getStatus() != 1) {
            throw new ServiceException("商品不存在或已下架");
        }
        
        // 检查库存
        if (product.getStock() < quantity) {
            throw new ServiceException("商品 " + product.getName() + " 库存不足");
        }
        
        // 创建订单项DTO
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setProductId(product.getId());
        itemDTO.setProductName(product.getName());
        itemDTO.setProductImage(product.getCoverImage());
        itemDTO.setProductPrice(product.getPrice());
        itemDTO.setQuantity(quantity);
        itemDTO.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
        itemDTO.setProductOrigin(product.getOrigin());
        
        return itemDTO;
    }
    
    @Override
    public List<OrderItemDTO> getCartItemsForOrder(Long userId, List<Long> cartItemIds) {
        // 获取购物车商品
        List<ShoppingCart> cartItems = cartMapper.selectByUserId(userId);
        
        // 过滤出选中的购物车项
        List<ShoppingCart> selectedItems = cartItems.stream()
                .filter(item -> cartItemIds.contains(item.getId()))
                .collect(Collectors.toList());
        
        if (selectedItems.isEmpty()) {
            throw new ServiceException("请选择要购买的商品");
        }
        
        // 转换为订单项
        return selectedItems.stream().map(cartItem -> {
            Product product = productMapper.selectById(cartItem.getProductId());
            if (product == null || product.getDeleted() || product.getStatus() != 1) {
                throw new ServiceException("商品 " + cartItem.getProductId() + " 不存在或已下架");
            }
            
            if (product.getStock() < cartItem.getQuantity()) {
                throw new ServiceException("商品 " + product.getName() + " 库存不足");
            }
            
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setId(cartItem.getId()); // 使用购物车项ID
            itemDTO.setProductId(product.getId());
            itemDTO.setProductName(product.getName());
            itemDTO.setProductImage(product.getCoverImage());
            itemDTO.setProductPrice(product.getPrice());
            itemDTO.setQuantity(cartItem.getQuantity());
            itemDTO.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            itemDTO.setProductOrigin(product.getOrigin());
            
            return itemDTO;
        }).collect(Collectors.toList());
    }
    
    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = BeanCopyUtils.copyBean(order, OrderDTO.class);
        
        // 设置状态描述
        dto.setStatusDesc(ORDER_STATUS_MAP.get(order.getOrderStatus()));
        dto.setPaymentStatusDesc(PAYMENT_STATUS_MAP.get(order.getPaymentStatus()));
        
        // 获取订单明细
        List<OrderItem> orderItems = orderItemMapper.selectByOrderId(order.getId());
        List<OrderItemDTO> orderItemDTOs = orderItems.stream()
                .map(item -> BeanCopyUtils.copyBean(item, OrderItemDTO.class))
                .collect(Collectors.toList());
        dto.setOrderItems(orderItemDTOs);
        
        return dto;
    }
    
    private String generateOrderNo() {
        // 生成订单号：当前时间戳 + 6位随机数
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = (int) (Math.random() * 900000) + 100000;
        return timestamp + random;
    }

    
}
