package com.cinema.booking.service.ai;

import com.cinema.booking.dto.AiChatResponse;
import com.cinema.booking.ienum.AiModuleEnum;
import com.cinema.booking.model.entity.AiChatRequest;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai
 * @createTime 2026-04-14  17:43
 * @description TODO
 */
public interface AiModuleHandler {
    AiModuleEnum getModule();
    // 统一入参，包含所有会话+用户信息
    AiChatResponse handle(AiChatRequest request);
}
