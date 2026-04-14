package com.cinema.booking.service.ai.impl;

import com.cinema.booking.dto.AiChatResponse;
import com.cinema.booking.dto.AiChatResponseDTO;
import com.cinema.booking.ienum.AiModuleEnum;
import com.cinema.booking.model.entity.AiChatRequest;
import com.cinema.booking.service.ai.AiModuleHandler;
import dev.langchain4j.model.chat.ChatModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

/**
 * @author JinYang
 * @version 1.0
 * @belongsProject rural-digital
 * @belongsPackage com.cinema.booking.service.ai.impl
 * @createTime 2026-04-14  17:42
 * @description TODO
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiRouterService {

    private final List<AiModuleHandler> moduleHandlers;
    private final ChatModel chatModel;

    public AiChatResponse chat(AiChatRequest request) {
        try {
            // ====================== 核心修复：后端生成会话ID ======================
            // 1. 前端第一次不传sessionId → 后端生成UUID
            String sessionId = (request.getSessionId() == null || request.getSessionId().isEmpty())
                    ? UUID.randomUUID().toString()  // 第一次：生成唯一会话ID
                    : request.getSessionId();       // 后续：使用前端传入的会话ID

            // 2. 覆盖设置sessionId，保证全链路一致
            request.setSessionId(sessionId);

            // 3. 意图识别
            AiModuleEnum module = recognizeModule(request.getMessage());

            // 4. 路由执行
            AiChatResponse response = getHandler(module).handle(request);

            // ====================== 核心修复：响应返回会话信息 ======================
            response.setSessionId(sessionId);
            response.setUserId(request.getUserId());

            return response;

        } catch (Exception e) {
            // 全局兜底：异常走特产模块
            AiChatResponse fallback = getHandler(AiModuleEnum.PRODUCT).handle(request);
            fallback.setSessionId(request.getSessionId() == null ? UUID.randomUUID().toString() : request.getSessionId());
            fallback.setUserId(request.getUserId());
            return fallback;
        }
    }

    // 意图识别（不变，业务级精准提示词）
    private AiModuleEnum recognizeModule(String message) {
        String prompt = """
                你是桃源县文旅AI分类器，仅返回1个枚举：PRODUCT/SCENIC/NEWS/ADVICE
                规则：特产/购买→PRODUCT，景点/游玩→SCENIC，新闻/政策/乡村振兴→NEWS，建议/反馈→ADVICE
                模糊问题默认返回PRODUCT
                用户问题：%s
                """;
        String result = chatModel.chat(String.format(prompt, message)).trim();
        log.info("识别的意图是：{}",result);
        return AiModuleEnum.valueOf(result);
    }

    private AiModuleHandler getHandler(AiModuleEnum module) {
        return moduleHandlers.stream()
                .filter(h -> h.getModule() == module)
                .findFirst()
                .orElseThrow();
    }
}
