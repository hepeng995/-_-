package com.cinema.booking.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.dto.ProductBatchDTO;
import com.cinema.booking.dto.TraceRecordDTO;
import com.cinema.booking.entity.ProductBatch;
import com.cinema.booking.entity.TraceRecord;
import com.cinema.booking.exception.ServiceException;
import com.cinema.booking.mapper.ProductBatchMapper;
import com.cinema.booking.mapper.TraceRecordMapper;
import com.cinema.booking.service.TraceService;
import com.cinema.booking.utils.BeanCopyUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TraceServiceImpl implements TraceService {

    private final TraceRecordMapper traceRecordMapper;
    private final ProductBatchMapper productBatchMapper;
    private final ObjectMapper objectMapper;

    @Value("${app.public-base-url:}")
    private String publicBaseUrl;

    @Override
    public String buildTraceQrCode(String batchNo) {
        try {
            String traceUrl = buildTraceUrl(batchNo);
            BitMatrix bitMatrix = new QRCodeWriter().encode(traceUrl, BarcodeFormat.QR_CODE, 260, 260);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public Map<String, Object> getTraceByProductId(Long productId) {
        ProductBatch batch = productBatchMapper.selectByProductId(productId);
        if (batch == null) {
            return null;
        }
        List<TraceRecord> records = traceRecordMapper.selectByProductId(productId);
        Map<String, Object> result = new HashMap<>();
        result.put("batch", toBatchDTO(batch));
        result.put("records", records.stream().map(this::toDTO).collect(Collectors.toList()));
        result.put("traceUrl", buildTraceUrl(batch.getBatchNo()));
        result.put("qrCodeDataUrl", buildTraceQrCode(batch.getBatchNo()));
        return result;
    }

    @Override
    public Map<String, Object> getTraceByBatchNo(String batchNo) {
        ProductBatch batch = productBatchMapper.selectByBatchNo(batchNo);
        if (batch == null) {
            return null;
        }
        List<TraceRecord> records = traceRecordMapper.selectByBatchNo(batchNo);
        Map<String, Object> result = new HashMap<>();
        result.put("batch", toBatchDTO(batch));
        result.put("records", records.stream().map(this::toDTO).collect(Collectors.toList()));
        result.put("traceUrl", buildTraceUrl(batch.getBatchNo()));
        result.put("qrCodeDataUrl", buildTraceQrCode(batch.getBatchNo()));
        return result;
    }

    @Override
    public boolean hasTraceData(Long productId) {
        ProductBatch batch = productBatchMapper.selectByProductId(productId);
        return batch != null;
    }

    @Override
    public IPage<TraceRecordDTO> getTracePage(PageRequest pageRequest, Long productId, String batchNo, String stage) {
        Page<TraceRecord> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        IPage<TraceRecord> recordPage = traceRecordMapper.selectTracePage(page, productId, batchNo, stage);
        return recordPage.convert(this::toDTO);
    }

    @Override
    @Transactional
    public TraceRecordDTO createTraceRecord(TraceRecordDTO dto) {
        TraceRecord entity = toEntity(dto);
        entity.setDeleted(false);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        traceRecordMapper.insert(entity);
        return toDTO(entity);
    }

    @Override
    @Transactional
    public TraceRecordDTO updateTraceRecord(Long id, TraceRecordDTO dto) {
        TraceRecord entity = traceRecordMapper.selectById(id);
        if (entity == null || entity.getDeleted()) {
            throw new ServiceException("溯源记录不存在");
        }
        updateEntityFromDTO(entity, dto);
        entity.setUpdatedAt(LocalDateTime.now());
        traceRecordMapper.updateById(entity);
        return toDTO(entity);
    }

    @Override
    @Transactional
    public void deleteTraceRecord(Long id) {
        TraceRecord entity = traceRecordMapper.selectById(id);
        if (entity == null || entity.getDeleted()) {
            throw new ServiceException("溯源记录不存在");
        }
        entity.setDeleted(true);
        entity.setUpdatedAt(LocalDateTime.now());
        traceRecordMapper.updateById(entity);
    }

    @Override
    public List<ProductBatchDTO> getBatches() {
        List<ProductBatch> batches = productBatchMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ProductBatch>()
                        .eq(ProductBatch::getStatus, 1)
                        .orderByAsc(ProductBatch::getId)
        );
        return batches.stream().map(this::toBatchDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductBatchDTO createBatch(ProductBatchDTO dto) {
        ProductBatch entity = BeanCopyUtils.copyBean(dto, ProductBatch.class);
        entity.setStatus(1);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        productBatchMapper.insert(entity);
        return toBatchDTO(entity);
    }

    @Override
    @Transactional
    public ProductBatchDTO updateBatch(Long id, ProductBatchDTO dto) {
        ProductBatch entity = productBatchMapper.selectById(id);
        if (entity == null) {
            throw new ServiceException("批次不存在");
        }
        if (dto.getProductId() != null) entity.setProductId(dto.getProductId());
        if (dto.getProductName() != null) entity.setProductName(dto.getProductName());
        if (dto.getBatchNo() != null) entity.setBatchNo(dto.getBatchNo());
        if (dto.getProductionDate() != null) entity.setProductionDate(dto.getProductionDate());
        if (dto.getShelfLife() != null) entity.setShelfLife(dto.getShelfLife());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        entity.setUpdatedAt(LocalDateTime.now());
        productBatchMapper.updateById(entity);
        return toBatchDTO(entity);
    }

    @Override
    @Transactional
    public void deleteBatch(Long id) {
        ProductBatch entity = productBatchMapper.selectById(id);
        if (entity == null) {
            throw new ServiceException("批次不存在");
        }
        productBatchMapper.deleteById(id);
    }

    @Override
    @Transactional
    public ProductBatchDTO toggleBatchStatus(Long id, Integer status) {
        ProductBatch entity = productBatchMapper.selectById(id);
        if (entity == null) {
            throw new ServiceException("批次不存在");
        }
        entity.setStatus(status != null ? status : (entity.getStatus() == 1 ? 0 : 1));
        entity.setUpdatedAt(LocalDateTime.now());
        productBatchMapper.updateById(entity);
        return toBatchDTO(entity);
    }

    private TraceRecordDTO toDTO(TraceRecord entity) {
        TraceRecordDTO dto = new TraceRecordDTO();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProductId());
        dto.setProductName(entity.getProductName());
        dto.setBatchNo(entity.getBatchNo());
        dto.setStage(entity.getStage());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setImages(parseJsonArray(entity.getImages()));
        dto.setLocation(entity.getLocation());
        dto.setOperatorName(entity.getOperatorName());
        dto.setOperatorType(entity.getOperatorType());
        dto.setOperationDate(entity.getOperationDate());
        dto.setNotes(parseJsonArray(entity.getNotes()));
        dto.setIsQualityCheck(entity.getIsQualityCheck());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        return dto;
    }

    private TraceRecord toEntity(TraceRecordDTO dto) {
        TraceRecord entity = new TraceRecord();
        entity.setProductId(dto.getProductId());
        entity.setProductName(dto.getProductName());
        entity.setBatchNo(dto.getBatchNo());
        entity.setStage(dto.getStage());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setImages(toJsonString(dto.getImages()));
        entity.setLocation(dto.getLocation());
        entity.setOperatorName(dto.getOperatorName());
        entity.setOperatorType(dto.getOperatorType());
        entity.setOperationDate(dto.getOperationDate());
        entity.setNotes(toJsonString(dto.getNotes()));
        entity.setIsQualityCheck(dto.getIsQualityCheck() != null && dto.getIsQualityCheck());
        return entity;
    }

    private void updateEntityFromDTO(TraceRecord entity, TraceRecordDTO dto) {
        if (dto.getProductId() != null) entity.setProductId(dto.getProductId());
        if (dto.getProductName() != null) entity.setProductName(dto.getProductName());
        if (dto.getBatchNo() != null) entity.setBatchNo(dto.getBatchNo());
        if (dto.getStage() != null) entity.setStage(dto.getStage());
        if (dto.getTitle() != null) entity.setTitle(dto.getTitle());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getImages() != null) entity.setImages(toJsonString(dto.getImages()));
        if (dto.getLocation() != null) entity.setLocation(dto.getLocation());
        if (dto.getOperatorName() != null) entity.setOperatorName(dto.getOperatorName());
        if (dto.getOperatorType() != null) entity.setOperatorType(dto.getOperatorType());
        if (dto.getOperationDate() != null) entity.setOperationDate(dto.getOperationDate());
        if (dto.getNotes() != null) entity.setNotes(toJsonString(dto.getNotes()));
        if (dto.getIsQualityCheck() != null) entity.setIsQualityCheck(dto.getIsQualityCheck());
    }

    private ProductBatchDTO toBatchDTO(ProductBatch entity) {
        ProductBatchDTO dto = new ProductBatchDTO();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProductId());
        dto.setProductName(entity.getProductName());
        dto.setBatchNo(entity.getBatchNo());
        dto.setProductionDate(entity.getProductionDate());
        dto.setShelfLife(entity.getShelfLife());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isEmpty()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    private String toJsonString(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private String buildTraceUrl(String batchNo) {
        String path = "/trace/" + batchNo;
        if (publicBaseUrl == null || publicBaseUrl.isBlank()) {
            return path;
        }
        return publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) + path : publicBaseUrl + path;
    }
}
