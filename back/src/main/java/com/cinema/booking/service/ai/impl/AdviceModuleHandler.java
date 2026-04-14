package com.cinema.booking.service.ai.impl;

import com.cinema.booking.dto.AiChatResponse;
import com.cinema.booking.ienum.AiModuleEnum;
import com.cinema.booking.model.entity.AiChatRequest;
import com.cinema.booking.service.ai.AiModuleHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai.impl
 * @createTime 2026-04-14  17:44
 * @description TODO
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class AdviceModuleHandler implements AiModuleHandler {

    @Override
    public AiModuleEnum getModule() {
        return AiModuleEnum.ADVICE;
    }

    @Override
    public AiChatResponse handle(AiChatRequest request) {
        // ====================== 核心：获取用户ID，绑定建言信息 ======================
        Long userId = request.getUserId();
        String userMessage = request.getMessage();
        log.info("【建言模块】用户ID：{}，反馈内容：{}", userId, userMessage);

        return AiChatResponse.builder()
                .moduleType(AiModuleEnum.ADVICE.name())
                .recommendText("""
                        已收到您的建言！
                        我们会根据您反馈的内容尽快核实处理。
                        """)
                .cardList(List.of())
                .build();
    }
}
