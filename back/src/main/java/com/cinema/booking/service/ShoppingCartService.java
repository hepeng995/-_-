package com.cinema.booking.service;

import com.cinema.booking.dto.ShoppingCartDTO;

import java.util.List;

/**
 * 购物车服务接口
 */
public interface ShoppingCartService {
    
    /**
     * 获取用户购物车列表
     * @param userId 用户ID
     * @return 购物车列表
     */
    List<ShoppingCartDTO> getCartItems(Long userId);
    
    /**
     * 添加商品到购物车
     * @param userId 用户ID
     * @param productId 商品ID
     * @param quantity 数量
     * @return 购物车项
     */
    ShoppingCartDTO addToCart(Long userId, Long productId, Integer quantity);
    
    /**
     * 更新购物车商品数量
     * @param userId 用户ID
     * @param productId 商品ID
     * @param quantity 数量
     * @return 更新后的购物车项
     */
    ShoppingCartDTO updateCartItem(Long userId, Long productId, Integer quantity);
    
    /**
     * 从购物车移除商品
     * @param userId 用户ID
     * @param productIds 商品ID列表
     */
    void removeFromCart(Long userId, List<Long> productIds);
    
    /**
     * 清空用户购物车
     * @param userId 用户ID
     */
    void clearCart(Long userId);
    
    /**
     * 获取购物车商品数量
     * @param userId 用户ID
     * @return 商品数量
     */
    Integer getCartItemCount(Long userId);
}
