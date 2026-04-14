package com.cinema.booking.controller;

import com.cinema.booking.dto.AiChatProductDTO;
import com.cinema.booking.dto.AiChatResponseDTO;
import com.cinema.booking.service.ai.impl.RagChatService;
import com.cinema.booking.utils.Result;
import dev.langchain4j.model.chat.ChatModel;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.controller
 * @createTime 2026-04-14  11:05
 * @description TODO
 */

@RestController
@AllArgsConstructor
public class ChatController {

    ChatModel chatModel;

    private final  RagChatService ragChatService;

    /**
     * 会话式AI对话接口
     * @param sessionId 用户唯一ID（前端传入）
     * @param message 用户问题
     * @return AI回答
     */
    // 🔥 和你项目所有接口格式完全统一！
    @Operation(summary = "AI智能导购对话")
    @GetMapping("/product")
    public Result<AiChatResponseDTO> chat(
            @RequestParam String sessionId,
            @RequestParam String message
    ) {
        AiChatResponseDTO response = ragChatService.chat(sessionId, message);
        return Result.ok(response);
    }

    @GetMapping("/chat")
    public String model(@RequestParam(value = "message", defaultValue = "Hello") String message) {
        return chatModel.chat(message);
    }
}
