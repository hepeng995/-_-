package com.cinema.booking.controller;

import com.cinema.booking.annotation.SystemOperation;
import com.cinema.booking.dto.AddressDTO;
import com.cinema.booking.security.SecurityService;
import com.cinema.booking.service.AddressService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 收货地址控制器
 */
@Tag(name = "收货地址管理", description = "收货地址相关接口")
@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@Validated
public class AddressController {
    
    private final AddressService addressService;
    private final SecurityService securityService;
    
    @Operation(summary = "获取用户收货地址列表")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Result<List<AddressDTO>> getUserAddresses() {
        Long userId = securityService.getCurrentUserId();
        List<AddressDTO> addresses = addressService.getUserAddresses(userId);
        return Result.ok(addresses);
    }
    
    @Operation(summary = "根据ID获取收货地址详情")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<AddressDTO> getAddressById(@PathVariable Long id) {
        Long userId = securityService.getCurrentUserId();
        AddressDTO address = addressService.getAddressById(id, userId);
        return Result.ok(address);
    }
    
    @Operation(summary = "创建收货地址")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "收货地址管理", operation = "创建地址", description = "创建收货地址")
    public Result<AddressDTO> createAddress(@Valid @RequestBody AddressDTO addressDTO) {
        Long userId = securityService.getCurrentUserId();
        AddressDTO created = addressService.createAddress(userId, addressDTO);
        return Result.ok(created);
    }
    
    @Operation(summary = "更新收货地址")
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "收货地址管理", operation = "更新地址", description = "更新收货地址")
    public Result<AddressDTO> updateAddress(@PathVariable Long id, @Valid @RequestBody AddressDTO addressDTO) {
        Long userId = securityService.getCurrentUserId();
        AddressDTO updated = addressService.updateAddress(id, userId, addressDTO);
        return Result.ok(updated);
    }
    
    @Operation(summary = "删除收货地址")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "收货地址管理", operation = "删除地址", description = "删除收货地址")
    public Result<Void> deleteAddress(@PathVariable Long id) {
        Long userId = securityService.getCurrentUserId();
        addressService.deleteAddress(id, userId);
        return Result.ok();
    }
    
    @Operation(summary = "设置默认地址")
    @PutMapping("/{id}/default")
    @PreAuthorize("isAuthenticated()")
    @SystemOperation(module = "收货地址管理", operation = "设置默认地址", description = "设置默认收货地址")
    public Result<Void> setDefaultAddress(@PathVariable Long id) {
        Long userId = securityService.getCurrentUserId();
        addressService.setDefaultAddress(id, userId);
        return Result.ok();
    }
}
