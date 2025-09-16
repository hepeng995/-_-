package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.CategoryDTO;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.dto.ProductDTO;
import com.cinema.booking.entity.Product;
import com.cinema.booking.entity.ProductCategory;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.ProductCategoryMapper;
import com.cinema.booking.mapper.ProductMapper;
import com.cinema.booking.service.ProductService;
import com.cinema.booking.utils.BeanCopyUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 商品服务实现类
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    
    private final ProductMapper productMapper;
    private final ProductCategoryMapper categoryMapper;
    
    @Override
    public IPage<ProductDTO> getProductPage(PageRequest pageRequest, Long categoryId, String keyword, Integer status, Boolean isFeatured) {
        Page<Product> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        IPage<Product> productPage = productMapper.selectProductPage(page, categoryId, keyword, status, isFeatured);
        
        return productPage.convert(product -> {
            ProductDTO dto = BeanCopyUtils.copyBean(product, ProductDTO.class);
            // 设置分类名称
            if (product.getCategoryId() != null) {
                ProductCategory category = categoryMapper.selectById(product.getCategoryId());
                if (category != null) {
                    dto.setCategoryName(category.getName());
                }
            }
            return dto;
        });
    }
    
    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null || product.getDeleted()) {
            throw new ServiceException("商品不存在");
        }
        
        ProductDTO dto = BeanCopyUtils.copyBean(product, ProductDTO.class);
        // 设置分类名称
        if (product.getCategoryId() != null) {
            ProductCategory category = categoryMapper.selectById(product.getCategoryId());
            if (category != null) {
                dto.setCategoryName(category.getName());
            }
        }
        return dto;
    }
    
    @Override
    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        // 验证分类是否存在
        if (productDTO.getCategoryId() != null) {
            ProductCategory category = categoryMapper.selectById(productDTO.getCategoryId());
            if (category == null || category.getStatus() != 1) {
                throw new ServiceException("商品分类不存在或已禁用");
            }
        }
        
        Product product = BeanCopyUtils.copyBean(productDTO, Product.class);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        product.setDeleted(false);
        product.setSalesCount(0);
        product.setRating(productDTO.getRating() != null ? productDTO.getRating() : java.math.BigDecimal.ZERO);
        product.setIsFeatured(productDTO.getIsFeatured() != null ? productDTO.getIsFeatured() : false);
        
        productMapper.insert(product);
        return BeanCopyUtils.copyBean(product, ProductDTO.class);
    }
    
    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productMapper.selectById(id);
        if (existingProduct == null || existingProduct.getDeleted()) {
            throw new ServiceException("商品不存在");
        }
        
        // 验证分类是否存在
        if (productDTO.getCategoryId() != null) {
            ProductCategory category = categoryMapper.selectById(productDTO.getCategoryId());
            if (category == null || category.getStatus() != 1) {
                throw new ServiceException("商品分类不存在或已禁用");
            }
        }
        
        Product product = BeanCopyUtils.copyBean(productDTO, Product.class);
        product.setId(id);
        product.setUpdatedAt(LocalDateTime.now());
        
        productMapper.updateById(product);
        return getProductById(id);
    }
    
    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null || product.getDeleted()) {
            throw new ServiceException("商品不存在");
        }
        
        product.setDeleted(true);
        product.setUpdatedAt(LocalDateTime.now());
        productMapper.updateById(product);
    }
    
    @Override
    public List<ProductDTO> getFeaturedProducts(Integer limit) {
        List<Product> products = productMapper.selectFeaturedProducts(limit);
        return products.stream()
                .map(product -> BeanCopyUtils.copyBean(product, ProductDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductDTO> getHotProducts(Integer limit) {
        List<Product> products = productMapper.selectHotProducts(limit);
        return products.stream()
                .map(product -> BeanCopyUtils.copyBean(product, ProductDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        List<Product> products = productMapper.selectByCategoryId(categoryId);
        return products.stream()
                .map(product -> BeanCopyUtils.copyBean(product, ProductDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public boolean updateStock(Long productId, Integer quantity) {
        int result = productMapper.updateStock(productId, quantity);
        return result > 0;
    }
    
    @Override
    @Transactional
    public void incrementSalesCount(Long productId, Integer quantity) {
        productMapper.incrementSalesCount(productId, quantity);
    }
    
    @Override
    public List<CategoryDTO> getProductCategories() {
        List<ProductCategory> categories = categoryMapper.selectEnabledCategories();
        return categories.stream()
                .map(category -> BeanCopyUtils.copyBean(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public CategoryDTO createProductCategory(CategoryDTO categoryDTO) {
        ProductCategory category = BeanCopyUtils.copyBean(categoryDTO, ProductCategory.class);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        category.setStatus(1); // 默认启用
        
        categoryMapper.insert(category);
        return BeanCopyUtils.copyBean(category, CategoryDTO.class);
    }
    
    @Override
    @Transactional
    public CategoryDTO updateProductCategory(Long id, CategoryDTO categoryDTO) {
        ProductCategory existingCategory = categoryMapper.selectById(id);
        if (existingCategory == null) {
            throw new ServiceException("分类不存在");
        }
        
        ProductCategory category = BeanCopyUtils.copyBean(categoryDTO, ProductCategory.class);
        category.setId(id);
        category.setUpdatedAt(LocalDateTime.now());
        
        categoryMapper.updateById(category);
        return BeanCopyUtils.copyBean(category, CategoryDTO.class);
    }
    
    @Override
    @Transactional
    public void deleteProductCategory(Long id) {
        ProductCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new ServiceException("分类不存在");
        }
        
        // 检查是否有关联的商品
        List<Product> products = productMapper.selectByCategoryId(id);
        if (!products.isEmpty()) {
            throw new ServiceException("该分类下还有商品，无法删除");
        }
        
        categoryMapper.deleteById(id);
    }
    
    @Override
    public Object getProductCategoriesPage(Integer current, Integer size, String keyword, Integer status) {
        Page<ProductCategory> page = new Page<>(current, size);
        
        LambdaQueryWrapper<ProductCategory> queryWrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            queryWrapper.like(ProductCategory::getName, keyword);
        }
        if (status != null) {
            queryWrapper.eq(ProductCategory::getStatus, status);
        }
        queryWrapper.orderByDesc(ProductCategory::getCreatedAt);
        
        IPage<ProductCategory> categoryPage = categoryMapper.selectPage(page, queryWrapper);
        
        // 转换结果
        Page<CategoryDTO> resultPage = new Page<>();
        BeanUtils.copyProperties(categoryPage, resultPage, "records");
        
        // 转换记录
        resultPage.setRecords(BeanCopyUtils.copyListProperties(categoryPage.getRecords(), CategoryDTO.class));
        
        Map<String, Object> result = new HashMap<>();
        result.put("records", resultPage.getRecords());
        result.put("total", resultPage.getTotal());
        result.put("pages", resultPage.getPages());
        result.put("current", resultPage.getCurrent());
        result.put("size", resultPage.getSize());
        
        return result;
    }
    
    @Override
    @Transactional
    public void updateProductCategoryStatus(Long id, Integer status) {
        ProductCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new ServiceException("分类不存在");
        }
        
        category.setStatus(status);
        categoryMapper.updateById(category);
    }
}
