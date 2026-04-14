package com.cinema.booking.controller;

import com.cinema.booking.dto.AiChatResponse;
import com.cinema.booking.model.entity.AiChatRequest;
import com.cinema.booking.service.ai.impl.AiRouterService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI智能对话统一接口（四大模块：商品/景点/资讯/建言）
 */
@RestController
@RequestMapping("/api/ai") // 统一接口前缀，符合REST规范
@RequiredArgsConstructor
@Tag(name = "AI对话接口", description = "会话式AI智能助手（商品/景点/资讯/建言）")
public class AiChatController {

    // 注入你已完成的路由服务（核心：分发到四大模块）
    private final AiRouterService aiRouterService;

    /**
     * 会话式AI对话统一接口（POST请求，适配四大模块）
     * @param request 统一请求体（包含sessionId/message/userId）
     * @return 统一响应体（包含会话信息+模块数据）
     */
    @Operation(summary = "AI智能对话（四大模块通用）", description = "支持商品/景点/资讯/建言，自动路由到对应模块")
    @PostMapping("/chat") // POST请求 + 统一路径，替代原有GET /product
    public Result<AiChatResponse> chat(
            @Parameter(description = "AI对话请求参数", required = true)
            @RequestBody AiChatRequest request // 用请求体传参，支持复杂参数（userId）
    ) {
        // 调用路由服务，自动分发到对应模块
        AiChatResponse response = aiRouterService.chat(request);
        // 兼容你项目原有Result.ok()格式
        return Result.ok(response);
    }
}
