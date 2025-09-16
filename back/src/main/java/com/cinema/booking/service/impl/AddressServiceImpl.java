package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cinema.booking.dto.AddressDTO;
import com.cinema.booking.entity.Address;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.AddressMapper;
import com.cinema.booking.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 收货地址服务实现类
 */
@Service
@RequiredArgsConstructor
public class AddressServiceImpl extends ServiceImpl<AddressMapper, Address> implements AddressService {
    
    private final AddressMapper addressMapper;
    
    @Override
    public List<AddressDTO> getUserAddresses(Long userId) {
        List<Address> addresses = addressMapper.selectByUserId(userId);
        return addresses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public AddressDTO getAddressById(Long id, Long userId) {
        Address address = addressMapper.selectByIdAndUserId(id, userId);
        if (address == null) {
            throw new ServiceException("地址不存在或无权限访问");
        }
        return convertToDTO(address);
    }
    
    @Override
    @Transactional
    public AddressDTO createAddress(Long userId, AddressDTO addressDTO) {
        Address address = new Address();
        BeanUtils.copyProperties(addressDTO, address);
        address.setUserId(userId);
        address.setCreatedAt(LocalDateTime.now());
        address.setUpdatedAt(LocalDateTime.now());
        
        // 如果设置为默认地址，先取消其他默认地址
        if (Boolean.TRUE.equals(addressDTO.getIsDefault())) {
            addressMapper.cancelDefaultByUserId(userId);
        }
        
        addressMapper.insert(address);
        return convertToDTO(address);
    }
    
    @Override
    @Transactional
    public AddressDTO updateAddress(Long id, Long userId, AddressDTO addressDTO) {
        Address existingAddress = addressMapper.selectByIdAndUserId(id, userId);
        if (existingAddress == null) {
            throw new ServiceException("地址不存在或无权限访问");
        }
        
        // 如果设置为默认地址，先取消其他默认地址
        if (Boolean.TRUE.equals(addressDTO.getIsDefault())) {
            addressMapper.cancelDefaultByUserId(userId);
        }
        
        BeanUtils.copyProperties(addressDTO, existingAddress, "id", "userId", "createdAt");
        existingAddress.setUpdatedAt(LocalDateTime.now());
        
        addressMapper.updateById(existingAddress);
        return convertToDTO(existingAddress);
    }
    
    @Override
    @Transactional
    public void deleteAddress(Long id, Long userId) {
        Address address = addressMapper.selectByIdAndUserId(id, userId);
        if (address == null) {
            throw new ServiceException("地址不存在或无权限访问");
        }
        
        int deleted = addressMapper.deleteByIdAndUserId(id, userId);
        if (deleted == 0) {
            throw new ServiceException("删除地址失败");
        }
    }
    
    @Override
    @Transactional
    public void setDefaultAddress(Long id, Long userId) {
        Address address = addressMapper.selectByIdAndUserId(id, userId);
        if (address == null) {
            throw new ServiceException("地址不存在或无权限访问");
        }
        
        // 先取消所有默认地址
        addressMapper.cancelDefaultByUserId(userId);
        
        // 设置当前地址为默认
        int updated = addressMapper.setDefaultAddress(id, userId);
        if (updated == 0) {
            throw new ServiceException("设置默认地址失败");
        }
    }
    
    /**
     * 实体转DTO
     */
    private AddressDTO convertToDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        BeanUtils.copyProperties(address, dto);
        return dto;
    }
}
