package com.cinema.booking.controller;

import com.cinema.booking.service.TraceService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "溯源查询", description = "商品溯源公开查询接口")
@RestController
@RequestMapping("/trace")
@RequiredArgsConstructor
public class TraceController {

    private final TraceService traceService;

    @Operation(summary = "按商品ID查询溯源信息")
    @GetMapping("/product/{productId}")
    public Result<Map<String, Object>> getTraceByProductId(
            @Parameter(description = "商品ID") @PathVariable Long productId) {
        Map<String, Object> data = traceService.getTraceByProductId(productId);
        if (data == null) {
            return Result.ok("无溯源数据", null);
        }
        return Result.ok(data);
    }

    @Operation(summary = "按批次号查询溯源信息")
    @GetMapping("/batch/{batchNo}")
    public Result<Map<String, Object>> getTraceByBatchNo(
            @Parameter(description = "批次号") @PathVariable String batchNo) {
        Map<String, Object> data = traceService.getTraceByBatchNo(batchNo);
        if (data == null) {
            return Result.fail(404, "批次不存在");
        }
        return Result.ok(data);
    }

    @Operation(summary = "检查商品是否有溯源数据")
    @GetMapping("/exists/{productId}")
    public Result<Boolean> hasTraceData(
            @Parameter(description = "商品ID") @PathVariable Long productId) {
        boolean exists = traceService.hasTraceData(productId);
        return Result.ok(exists);
    }
}
