package com.cinema.booking.service.impl;

import com.cinema.booking.dto.ShoppingCartDTO;
import com.cinema.booking.entity.Product;
import com.cinema.booking.entity.ShoppingCart;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.ProductMapper;
import com.cinema.booking.mapper.ShoppingCartMapper;
import com.cinema.booking.service.ShoppingCartService;
import com.cinema.booking.utils.BeanCopyUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 购物车服务实现类
 */
@Service
@RequiredArgsConstructor
public class ShoppingCartServiceImpl implements ShoppingCartService {
    
    private final ShoppingCartMapper cartMapper;
    private final ProductMapper productMapper;
    
    @Override
    public List<ShoppingCartDTO> getCartItems(Long userId) {
        List<ShoppingCart> cartItems = cartMapper.selectByUserId(userId);
        
        return cartItems.stream().map(cartItem -> {
            ShoppingCartDTO dto = BeanCopyUtils.copyBean(cartItem, ShoppingCartDTO.class);
            
            // 获取商品信息
            Product product = productMapper.selectById(cartItem.getProductId());
            if (product != null && !product.getDeleted() && product.getStatus() == 1) {
                dto.setProductName(product.getName());
                dto.setProductImage(product.getCoverImage());
                dto.setProductPrice(product.getPrice());
                dto.setProductStock(product.getStock());
                dto.setProductUnit(product.getUnit());
                dto.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            } else {
                // 商品已下架或删除，标记为无效
                dto.setProductName("商品已下架");
                dto.setProductPrice(BigDecimal.ZERO);
                dto.setProductStock(0);
                dto.setTotalPrice(BigDecimal.ZERO);
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ShoppingCartDTO addToCart(Long userId, Long productId, Integer quantity) {
        // 验证商品是否存在且可购买
        Product product = productMapper.selectById(productId);
        if (product == null || product.getDeleted() || product.getStatus() != 1) {
            throw new ServiceException("商品不存在或已下架");
        }
        
        if (product.getStock() < quantity) {
            throw new ServiceException("商品库存不足");
        }
        
        // 检查购物车中是否已存在该商品
        ShoppingCart existingItem = cartMapper.selectByUserIdAndProductId(userId, productId);
        
        if (existingItem != null) {
            // 更新数量
            Integer newQuantity = existingItem.getQuantity() + quantity;
            if (product.getStock() < newQuantity) {
                throw new ServiceException("商品库存不足");
            }
            
            cartMapper.updateQuantity(userId, productId, newQuantity);
            existingItem.setQuantity(newQuantity);
            existingItem.setUpdatedAt(LocalDateTime.now());
            
            return convertToDTO(existingItem, product);
        } else {
            // 新增购物车项
            ShoppingCart cartItem = ShoppingCart.builder()
                    .userId(userId)
                    .productId(productId)
                    .quantity(quantity)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            cartMapper.insert(cartItem);
            return convertToDTO(cartItem, product);
        }
    }
    
    @Override
    @Transactional
    public ShoppingCartDTO updateCartItem(Long userId, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new ServiceException("商品数量必须大于0");
        }
        
        // 验证商品库存
        Product product = productMapper.selectById(productId);
        if (product == null || product.getDeleted() || product.getStatus() != 1) {
            throw new ServiceException("商品不存在或已下架");
        }
        
        if (product.getStock() < quantity) {
            throw new ServiceException("商品库存不足");
        }
        
        // 检查购物车项是否存在
        ShoppingCart cartItem = cartMapper.selectByUserIdAndProductId(userId, productId);
        if (cartItem == null) {
            throw new ServiceException("购物车项不存在");
        }
        
        int result = cartMapper.updateQuantity(userId, productId, quantity);
        if (result > 0) {
            cartItem.setQuantity(quantity);
            cartItem.setUpdatedAt(LocalDateTime.now());
            return convertToDTO(cartItem, product);
        } else {
            throw new ServiceException("更新购物车失败");
        }
    }
    
    @Override
    @Transactional
    public void removeFromCart(Long userId, List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return;
        }
        
        cartMapper.deleteByUserIdAndProductIds(userId, productIds);
    }
    
    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartMapper.deleteByUserId(userId);
    }
    
    @Override
    public Integer getCartItemCount(Long userId) {
        List<ShoppingCart> cartItems = cartMapper.selectByUserId(userId);
        return cartItems.stream()
                .mapToInt(ShoppingCart::getQuantity)
                .sum();
    }
    
    private ShoppingCartDTO convertToDTO(ShoppingCart cartItem, Product product) {
        ShoppingCartDTO dto = BeanCopyUtils.copyBean(cartItem, ShoppingCartDTO.class);
        dto.setProductName(product.getName());
        dto.setProductImage(product.getCoverImage());
        dto.setProductPrice(product.getPrice());
        dto.setProductStock(product.getStock());
        dto.setProductUnit(product.getUnit());
        dto.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        return dto;
    }
}
