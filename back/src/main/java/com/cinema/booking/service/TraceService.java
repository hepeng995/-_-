package com.cinema.booking.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.ProductBatchDTO;
import com.cinema.booking.dto.TraceRecordDTO;
import com.cinema.booking.dto.PageRequest;

import java.util.List;
import java.util.Map;

public interface TraceService {

    String buildTraceQrCode(String batchNo);

    Map<String, Object> getTraceByProductId(Long productId);

    Map<String, Object> getTraceByBatchNo(String batchNo);

    boolean hasTraceData(Long productId);

    IPage<TraceRecordDTO> getTracePage(PageRequest pageRequest, Long productId, String batchNo, String stage);

    TraceRecordDTO createTraceRecord(TraceRecordDTO dto);

    TraceRecordDTO updateTraceRecord(Long id, TraceRecordDTO dto);

    void deleteTraceRecord(Long id);

    List<ProductBatchDTO> getBatches();

    ProductBatchDTO createBatch(ProductBatchDTO dto);
}
