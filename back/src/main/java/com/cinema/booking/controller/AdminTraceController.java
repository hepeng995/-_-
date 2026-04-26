package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cinema.booking.dto.PageRequest;
import com.cinema.booking.dto.ProductBatchDTO;
import com.cinema.booking.dto.TraceRecordDTO;
import com.cinema.booking.service.TraceService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "溯源管理", description = "溯源记录管理接口")
@RestController
@RequestMapping("/admin/trace")
@RequiredArgsConstructor
@Validated
public class AdminTraceController {

    private final TraceService traceService;

    @Operation(summary = "分页查询溯源记录")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<IPage<TraceRecordDTO>> getTracePage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String batchNo,
            @RequestParam(required = false) String stage) {
        PageRequest pageRequest = new PageRequest(pageNum, pageSize);
        IPage<TraceRecordDTO> page = traceService.getTracePage(pageRequest, productId, batchNo, stage);
        return Result.ok(page);
    }

    @Operation(summary = "新增溯源记录")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<TraceRecordDTO> createTraceRecord(@RequestBody TraceRecordDTO dto) {
        TraceRecordDTO created = traceService.createTraceRecord(dto);
        return Result.ok(created);
    }

    @Operation(summary = "更新溯源记录")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<TraceRecordDTO> updateTraceRecord(
            @Parameter(description = "溯源记录ID") @PathVariable Long id,
            @RequestBody TraceRecordDTO dto) {
        TraceRecordDTO updated = traceService.updateTraceRecord(id, dto);
        return Result.ok(updated);
    }

    @Operation(summary = "删除溯源记录")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteTraceRecord(
            @Parameter(description = "溯源记录ID") @PathVariable Long id) {
        traceService.deleteTraceRecord(id);
        return Result.ok();
    }

    @Operation(summary = "获取所有批次列表")
    @GetMapping("/batches")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<ProductBatchDTO>> getBatches() {
        List<ProductBatchDTO> batches = traceService.getBatches();
        return Result.ok(batches);
    }

    @Operation(summary = "新增产品批次")
    @PostMapping("/batches")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<ProductBatchDTO> createBatch(@RequestBody ProductBatchDTO dto) {
        ProductBatchDTO created = traceService.createBatch(dto);
        return Result.ok(created);
    }
}
