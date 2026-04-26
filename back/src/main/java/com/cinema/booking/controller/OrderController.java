package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.OrderDTO;
import com.cinema.booking.dto.OrderItemDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.entity.Order;
import com.cinema.booking.mapper.OrderMapper;
import com.cinema.booking.security.SecurityService;
import com.cinema.booking.service.OrderService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;
import java.util.List;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 订单控制器
 */
@Tag(name = "订单管理", description = "订单相关接口")
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Validated
public class OrderController {
    
    private final OrderService orderService;
    private final SecurityService securityService;
    private final OrderMapper orderMapper;
    
    @Operation(summary = "分页查询订单列表")
    @GetMapping("/page")
    @PreAuthorize("isAuthenticated()")
    public Result<IPage<OrderDTO>> getOrderPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "订单状态") @RequestParam(required = false) Integer orderStatus,
            @Parameter(description = "支付状态") @RequestParam(required = false) Integer paymentStatus,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword) {
        
        PageRequest pageRequest = new PageRequest(pageNum, pageSize);
        Long userId = securityService.getCurrentUserId();
        
        // 非管理员只能查看自己的订单
        if (!securityService.hasRole("ADMIN")) {
            IPage<OrderDTO> page = orderService.getOrderPage(pageRequest, userId, orderStatus, paymentStatus, keyword);
            return Result.ok(page);
        } else {
            // 管理员可以查看所有订单
            IPage<OrderDTO> page = orderService.getOrderPage(pageRequest, null, orderStatus, paymentStatus, keyword);
            return Result.ok(page);
        }
    }
    
    @Operation(summary = "获取订单详情")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<OrderDTO> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        
        // 非管理员只能查看自己的订单
        Long currentUserId = securityService.getCurrentUserId();
        if (!securityService.hasRole("ADMIN") && !order.getUserId().equals(currentUserId)) {
            return Result.error("无权访问该订单");
        }
        
        return Result.ok(order);
    }
    
    @Operation(summary = "根据订单号获取订单详情")
    @GetMapping("/orderNo/{orderNo}")
    @PreAuthorize("isAuthenticated()")
    public Result<OrderDTO> getOrderByOrderNo(@PathVariable String orderNo) {
        OrderDTO order = orderService.getOrderByOrderNo(orderNo);
        
        // 非管理员只能查看自己的订单
        Long currentUserId = securityService.getCurrentUserId();
        if (!securityService.hasRole("ADMIN") && !order.getUserId().equals(currentUserId)) {
            return Result.error("无权访问该订单");
        }
        
        return Result.ok(order);
    }
    
    @Operation(summary = "创建订单")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "订单管理", operation = "创建订单", description = "创建新订单")
    public Result<OrderDTO> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        Long userId = securityService.getCurrentUserId();
        orderDTO.setUserId(userId);
        
        OrderDTO created = orderService.createOrder(orderDTO);
        return Result.ok(created);
    }
    
    @Operation(summary = "从购物车创建订单")
    @PostMapping("/from-cart")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "订单管理", operation = "从购物车创建订单", description = "从购物车创建订单")
    public Result<OrderDTO> createOrderFromCart(@Valid @RequestBody CreateOrderFromCartRequest request) {
        Long userId = securityService.getCurrentUserId();
        
        // 创建订单DTO
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setUserId(userId);
        orderDTO.setDeliveryAddress(request.getDeliveryAddress());
        orderDTO.setDeliveryName(request.getDeliveryName());
        orderDTO.setDeliveryPhone(request.getDeliveryPhone());
        orderDTO.setPaymentMethod(request.getPaymentMethod());
        orderDTO.setTotalAmount(request.getTotalAmount());
        orderDTO.setActualAmount(request.getActualAmount());
        orderDTO.setDiscountAmount(request.getDiscountAmount());
        orderDTO.setRemark(request.getRemark());
        
        OrderDTO order = orderService.createOrderFromCart(
                userId,
                request.getProductIds(),
                orderDTO
        );
        
        return Result.ok(order);
    }
    
    @Operation(summary = "更新订单状态")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "订单管理", operation = "更新订单状态", description = "管理员更新订单状态")
    public Result<OrderDTO> updateOrderStatus(@PathVariable Long id, @RequestParam Integer orderStatus) {
        OrderDTO updated = orderService.updateOrderStatus(id, orderStatus);
        return Result.ok(updated);
    }

    @Operation(summary = "批量更新订单状态")
    @PutMapping("/batch/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "订单管理", operation = "批量更新订单状态", description = "管理员批量更新订单状态")
    public Result<Void> batchUpdateOrderStatus(@RequestBody Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        List<Long> ids = (List<Long>) params.get("ids");
        Integer orderStatus = (Integer) params.get("orderStatus");
        LambdaUpdateWrapper<Order> wrapper = new LambdaUpdateWrapper<>();
        wrapper.in(Order::getId, ids).set(Order::getOrderStatus, orderStatus);
        orderMapper.update(null, wrapper);
        return Result.ok();
    }

    @Operation(summary = "批量取消订单")
    @PutMapping("/batch/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "订单管理", operation = "批量取消订单", description = "管理员批量取消订单")
    public Result<Void> batchCancelOrders(@RequestBody Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        List<Long> ids = (List<Long>) params.get("ids");
        String cancelReason = (String) params.getOrDefault("cancelReason", "管理员批量取消");
        LambdaUpdateWrapper<Order> wrapper = new LambdaUpdateWrapper<>();
        wrapper.in(Order::getId, ids)
                .set(Order::getOrderStatus, 5)
                .set(Order::getCancelReason, cancelReason);
        orderMapper.update(null, wrapper);
        return Result.ok();
    }
    
    @Operation(summary = "取消订单")
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "订单管理", operation = "取消订单", description = "取消订单")
    public Result<OrderDTO> cancelOrder(@PathVariable Long id, @RequestParam(required = false) String cancelReason) {
        OrderDTO order = orderService.getOrderById(id);
        
        // 非管理员只能取消自己的订单
        Long currentUserId = securityService.getCurrentUserId();
        if (!securityService.hasRole("ADMIN") && !order.getUserId().equals(currentUserId)) {
            return Result.error("无权操作该订单");
        }
        
        OrderDTO cancelled = orderService.cancelOrder(id, cancelReason != null ? cancelReason : "用户取消");
        return Result.ok(cancelled);
    }
    
    @Operation(summary = "确认收货")
    @PutMapping("/{id}/confirm")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "订单管理", operation = "确认收货", description = "确认收货")
    public Result<OrderDTO> confirmReceived(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        
        // 只能确认自己的订单
        Long currentUserId = securityService.getCurrentUserId();
        if (!order.getUserId().equals(currentUserId)) {
            return Result.error("无权操作该订单");
        }
        
        OrderDTO confirmed = orderService.confirmReceived(id);
        return Result.ok(confirmed);
    }
    
    @Operation(summary = "模拟支付")
    @PostMapping("/pay")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "订单管理", operation = "模拟支付", description = "模拟支付订单")
    public Result<Boolean> simulatePayment(@Valid @RequestBody PaymentRequest request) {
        OrderDTO order = orderService.getOrderByOrderNo(request.getOrderNo());
        
        // 只能支付自己的订单
        Long currentUserId = securityService.getCurrentUserId();
        if (!order.getUserId().equals(currentUserId)) {
            return Result.error("无权支付该订单");
        }
        
        boolean success = orderService.simulatePayment(request.getOrderNo(), request.getPaymentMethod());
        return Result.ok(success);
    }
    
    @Operation(summary = "获取用户订单统计")
    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public Result<OrderService.OrderStatisticsDTO> getUserOrderStatistics() {
        Long userId = securityService.getCurrentUserId();
        OrderService.OrderStatisticsDTO statistics = orderService.getUserOrderStatistics(userId);
        return Result.ok(statistics);
    }
    
    @Operation(summary = "获取订单统计（管理员）")
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @SystemOperation(module = "订单管理", operation = "获取订单统计", description = "获取订单统计数据")
    public Result<OrderService.OrderStatsDTO> getOrderStats() {
        OrderService.OrderStatsDTO stats = orderService.getOrderStats();
        return Result.ok(stats);
    }
    
    @Operation(summary = "获取当前用户的订单列表")
    @GetMapping("/user-orders")
    @PreAuthorize("isAuthenticated()")
    public Result<IPage<OrderDTO>> getUserOrders(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "订单状态") @RequestParam(required = false) String status) {
        
        PageRequest pageRequest = new PageRequest(pageNum, pageSize);
        Long userId = securityService.getCurrentUserId();
        
        IPage<OrderDTO> page = orderService.getOrderPage(pageRequest, userId, null, null, null, status);
        return Result.ok(page);
    }
    
    @Operation(summary = "获取商品信息用于订单确认")
    @GetMapping("/product/{productId}")
    @PreAuthorize("isAuthenticated()")
    public Result<OrderItemDTO> getProductForOrder(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            @RequestParam(required = false) String specification) {
        OrderItemDTO orderItem = orderService.getProductForOrder(productId, quantity, specification);
        return Result.ok(orderItem);
    }
    
    @Operation(summary = "获取购物车商品用于订单确认")
    @PostMapping("/cart-items")
    @PreAuthorize("isAuthenticated()")
    public Result<List<OrderItemDTO>> getCartItemsForOrder(@RequestBody Map<String, List<Long>> request) {
        Long userId = securityService.getCurrentUserId();
        List<Long> itemIds = request.get("itemIds");
        if (itemIds == null || itemIds.isEmpty()) {
            return Result.error("请选择要结算的商品");
        }
        List<OrderItemDTO> orderItems = orderService.getCartItemsForOrder(userId, itemIds);
        return Result.ok(orderItems);
    }
    
    
    /**
     * 从购物车创建订单请求
     */
    @Data
    public static class CreateOrderFromCartRequest {
        @NotEmpty(message = "商品列表不能为空")
        private List<Long> productIds;
        
        @NotBlank(message = "收货地址不能为空")
        private String deliveryAddress;
        
        @NotBlank(message = "收货人姓名不能为空")
        private String deliveryName;
        
        @NotBlank(message = "收货人电话不能为空")
        private String deliveryPhone;
        
        @NotBlank(message = "支付方式不能为空")
        private String paymentMethod;
        
        @NotNull(message = "订单总金额不能为空")
        private BigDecimal totalAmount;
        
        @NotNull(message = "实付金额不能为空")
        private BigDecimal actualAmount;
        
        private BigDecimal discountAmount;
        
        private String remark;
    }
    
    /**
     * 支付请求
     */
    @Data
    public static class PaymentRequest {
        @NotBlank(message = "订单号不能为空")
        private String orderNo;
        
        @NotBlank(message = "支付方式不能为空")
        private String paymentMethod;
    }

    
}
