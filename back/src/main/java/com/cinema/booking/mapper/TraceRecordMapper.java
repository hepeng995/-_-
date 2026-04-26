package com.cinema.booking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.entity.TraceRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TraceRecordMapper extends BaseMapper<TraceRecord> {

    IPage<TraceRecord> selectTracePage(Page<TraceRecord> page,
                                        @Param("productId") Long productId,
                                        @Param("batchNo") String batchNo,
                                        @Param("stage") String stage);

    List<TraceRecord> selectByBatchNo(@Param("batchNo") String batchNo);

    List<TraceRecord> selectByProductId(@Param("productId") Long productId);
}
