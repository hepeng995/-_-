package com.cinema.booking.controller;

import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.ShoppingCartDTO;
import com.cinema.booking.security.SecurityService;
import com.cinema.booking.service.ShoppingCartService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 购物车控制器
 */
@Tag(name = "购物车管理", description = "购物车相关接口")
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Validated
public class ShoppingCartController {
    
    private final ShoppingCartService cartService;
    private final SecurityService securityService;
    
    @Operation(summary = "获取购物车列表")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Result<List<ShoppingCartDTO>> getCartItems() {
        Long userId = securityService.getCurrentUserId();
        List<ShoppingCartDTO> cartItems = cartService.getCartItems(userId);
        return Result.ok(cartItems);
    }
    
    @Operation(summary = "添加商品到购物车")
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "购物车管理", operation = "添加商品", description = "添加商品到购物车")
    public Result<ShoppingCartDTO> addToCart(
            @Parameter(description = "商品ID") @RequestParam @NotNull(message = "商品ID不能为空") Long productId,
            @Parameter(description = "数量") @RequestParam @Min(value = 1, message = "数量必须大于0") Integer quantity) {
        Long userId = securityService.getCurrentUserId();
        ShoppingCartDTO cartItem = cartService.addToCart(userId, productId, quantity);
        return Result.ok(cartItem);
    }
    
    @Operation(summary = "更新购物车商品数量")
    @PutMapping("/update")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "购物车管理", operation = "更新数量", description = "更新购物车商品数量")
    public Result<ShoppingCartDTO> updateCartItem(
            @Parameter(description = "商品ID") @RequestParam @NotNull(message = "商品ID不能为空") Long productId,
            @Parameter(description = "数量") @RequestParam @Min(value = 1, message = "数量必须大于0") Integer quantity) {
        Long userId = securityService.getCurrentUserId();
        ShoppingCartDTO cartItem = cartService.updateCartItem(userId, productId, quantity);
        return Result.ok(cartItem);
    }
    
    @Operation(summary = "从购物车移除商品")
    @DeleteMapping("/remove")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "购物车管理", operation = "移除商品", description = "从购物车移除商品")
    public Result<Void> removeFromCart(@RequestBody List<Long> productIds) {
        Long userId = securityService.getCurrentUserId();
        cartService.removeFromCart(userId, productIds);
        return Result.ok();
    }
    
    @Operation(summary = "清空购物车")
    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "购物车管理", operation = "清空购物车", description = "清空用户购物车")
    public Result<Void> clearCart() {
        Long userId = securityService.getCurrentUserId();
        cartService.clearCart(userId);
        return Result.ok();
    }
    
    @Operation(summary = "获取购物车商品数量")
    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public Result<Integer> getCartItemCount() {
        Long userId = securityService.getCurrentUserId();
        Integer count = cartService.getCartItemCount(userId);
        return Result.ok(count);
    }
}
