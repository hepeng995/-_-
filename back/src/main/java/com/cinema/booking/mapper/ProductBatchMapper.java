package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.ProductBatch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ProductBatchMapper extends BaseMapper<ProductBatch> {

    ProductBatch selectByProductId(@Param("productId") Long productId);

    ProductBatch selectByBatchNo(@Param("batchNo") String batchNo);
}
