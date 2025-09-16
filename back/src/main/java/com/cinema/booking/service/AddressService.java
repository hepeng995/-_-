package com.cinema.booking.service;

import com.cinema.booking.dto.AddressDTO;

import java.util.List;

/**
 * 收货地址服务接口
 */
public interface AddressService {
    
    /**
     * 获取用户收货地址列表
     * @param userId 用户ID
     * @return 收货地址列表
     */
    List<AddressDTO> getUserAddresses(Long userId);
    
    /**
     * 根据ID获取收货地址详情
     * @param id 地址ID
     * @param userId 用户ID
     * @return 收货地址详情
     */
    AddressDTO getAddressById(Long id, Long userId);
    
    /**
     * 创建收货地址
     * @param userId 用户ID
     * @param addressDTO 地址信息
     * @return 创建的地址信息
     */
    AddressDTO createAddress(Long userId, AddressDTO addressDTO);
    
    /**
     * 更新收货地址
     * @param id 地址ID
     * @param userId 用户ID
     * @param addressDTO 地址信息
     * @return 更新后的地址信息
     */
    AddressDTO updateAddress(Long id, Long userId, AddressDTO addressDTO);
    
    /**
     * 删除收货地址
     * @param id 地址ID
     * @param userId 用户ID
     */
    void deleteAddress(Long id, Long userId);
    
    /**
     * 设置默认地址
     * @param id 地址ID
     * @param userId 用户ID
     */
    void setDefaultAddress(Long id, Long userId);
}
