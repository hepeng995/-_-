package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.AttractionDTO;
import com.cinema.booking.dto.CategoryDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.entity.Attraction;
import com.cinema.booking.entity.AttractionCategory;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.AttractionCategoryMapper;
import com.cinema.booking.mapper.AttractionMapper;
import com.cinema.booking.service.AttractionService;
import com.cinema.booking.utils.BeanCopyUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 景点服务实现类
 */
@Service
@RequiredArgsConstructor
public class AttractionServiceImpl implements AttractionService {
    
    private final AttractionMapper attractionMapper;
    private final AttractionCategoryMapper categoryMapper;
    
    @Override
    public IPage<AttractionDTO> getAttractionPage(PageRequest pageRequest, Long categoryId, String keyword, Integer status) {
        Page<Attraction> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        IPage<Attraction> attractionPage = attractionMapper.selectAttractionPage(page, categoryId, keyword, status);
        
        return attractionPage.convert(attraction -> {
            AttractionDTO dto = BeanCopyUtils.copyBean(attraction, AttractionDTO.class);
            // 设置分类名称
            if (attraction.getCategoryId() != null) {
                AttractionCategory category = categoryMapper.selectById(attraction.getCategoryId());
                if (category != null) {
                    dto.setCategoryName(category.getName());
                }
            }
            return dto;
        });
    }
    
    @Override
    public AttractionDTO getAttractionById(Long id) {
        Attraction attraction = attractionMapper.selectById(id);
        if (attraction == null || attraction.getDeleted()) {
            throw new ServiceException("景点不存在");
        }
        
        AttractionDTO dto = BeanCopyUtils.copyBean(attraction, AttractionDTO.class);
        // 设置分类名称
        if (attraction.getCategoryId() != null) {
            AttractionCategory category = categoryMapper.selectById(attraction.getCategoryId());
            if (category != null) {
                dto.setCategoryName(category.getName());
            }
        }
        return dto;
    }
    
    @Override
    @Transactional
    public AttractionDTO createAttraction(AttractionDTO attractionDTO) {
        // 验证分类是否存在
        if (attractionDTO.getCategoryId() != null) {
            AttractionCategory category = categoryMapper.selectById(attractionDTO.getCategoryId());
            if (category == null || category.getStatus() != 1) {
                throw new ServiceException("景点分类不存在或已禁用");
            }
        }
        
        Attraction attraction = BeanCopyUtils.copyBean(attractionDTO, Attraction.class);
        attraction.setCreatedAt(LocalDateTime.now());
        attraction.setUpdatedAt(LocalDateTime.now());
        attraction.setDeleted(false);
        attraction.setViewCount(0);
        attraction.setRating(attractionDTO.getRating() != null ? attractionDTO.getRating() : java.math.BigDecimal.ZERO);
        
        attractionMapper.insert(attraction);
        return BeanCopyUtils.copyBean(attraction, AttractionDTO.class);
    }
    
    @Override
    @Transactional
    public AttractionDTO updateAttraction(Long id, AttractionDTO attractionDTO) {
        Attraction existingAttraction = attractionMapper.selectById(id);
        if (existingAttraction == null || existingAttraction.getDeleted()) {
            throw new ServiceException("景点不存在");
        }
        
        // 验证分类是否存在
        if (attractionDTO.getCategoryId() != null) {
            AttractionCategory category = categoryMapper.selectById(attractionDTO.getCategoryId());
            if (category == null || category.getStatus() != 1) {
                throw new ServiceException("景点分类不存在或已禁用");
            }
        }
        
        Attraction attraction = BeanCopyUtils.copyBean(attractionDTO, Attraction.class);
        attraction.setId(id);
        attraction.setUpdatedAt(LocalDateTime.now());
        
        attractionMapper.updateById(attraction);
        return getAttractionById(id);
    }
    
    @Override
    @Transactional
    public void deleteAttraction(Long id) {
        Attraction attraction = attractionMapper.selectById(id);
        if (attraction == null || attraction.getDeleted()) {
            throw new ServiceException("景点不存在");
        }
        
        attraction.setDeleted(true);
        attraction.setUpdatedAt(LocalDateTime.now());
        attractionMapper.updateById(attraction);
    }
    
    @Override
    public List<AttractionDTO> getRecommendAttractions(Integer limit) {
        List<Attraction> attractions = attractionMapper.selectRecommendAttractions(limit);
        return attractions.stream()
                .map(attraction -> BeanCopyUtils.copyBean(attraction, AttractionDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AttractionDTO> getHotAttractions(Integer limit) {
        List<Attraction> attractions = attractionMapper.selectHotAttractions(limit);
        return attractions.stream()
                .map(attraction -> BeanCopyUtils.copyBean(attraction, AttractionDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AttractionDTO> getAttractionsByCategory(Long categoryId) {
        List<Attraction> attractions = attractionMapper.selectByCategoryId(categoryId);
        return attractions.stream()
                .map(attraction -> BeanCopyUtils.copyBean(attraction, AttractionDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    public void incrementViewCount(Long id) {
        attractionMapper.incrementViewCount(id);
    }
    
    @Override
    public List<CategoryDTO> getAttractionCategories() {
        List<AttractionCategory> categories = categoryMapper.selectEnabledCategories();
        return categories.stream()
                .map(category -> BeanCopyUtils.copyBean(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public CategoryDTO createAttractionCategory(CategoryDTO categoryDTO) {
        AttractionCategory category = BeanCopyUtils.copyBean(categoryDTO, AttractionCategory.class);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        category.setStatus(1); // 默认启用
        
        categoryMapper.insert(category);
        return BeanCopyUtils.copyBean(category, CategoryDTO.class);
    }
    
    @Override
    @Transactional
    public CategoryDTO updateAttractionCategory(Long id, CategoryDTO categoryDTO) {
        AttractionCategory existingCategory = categoryMapper.selectById(id);
        if (existingCategory == null) {
            throw new ServiceException("分类不存在");
        }
        
        AttractionCategory category = BeanCopyUtils.copyBean(categoryDTO, AttractionCategory.class);
        category.setId(id);
        category.setUpdatedAt(LocalDateTime.now());
        
        categoryMapper.updateById(category);
        return BeanCopyUtils.copyBean(category, CategoryDTO.class);
    }
    
    @Override
    @Transactional
    public void deleteAttractionCategory(Long id) {
        AttractionCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new ServiceException("分类不存在");
        }
        
        // 检查是否有关联的景点
        List<Attraction> attractions = attractionMapper.selectByCategoryId(id);
        if (!attractions.isEmpty()) {
            throw new ServiceException("该分类下还有景点，无法删除");
        }
        
        categoryMapper.deleteById(id);
    }
}
