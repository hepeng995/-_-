//package com.cinema.booking;
//
//import com.cinema.booking.service.ai.impl.VectorSyncService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.boot.ApplicationArguments;
//import org.springframework.boot.ApplicationRunner;
//import org.springframework.stereotype.Component;
//
///**
// * @author JinYang
// * @version 1.0
// * @belongsProject rural-digital
// * @belongsPackage com.cinema.booking
// * @createTime 2026-04-13  20:05
// * @description TODO
// */
//
//@Slf4j
//@Component
//@RequiredArgsConstructor // ✅ 依然需要它来注入 VectorSyncService
//public class VectorDataInitializer implements ApplicationRunner {
//
//    private final VectorSyncService vectorSyncService;
//
//    @Override
//    public void run(ApplicationArguments args) throws Exception {
//        log.info("🚀 检测到项目启动，开始执行向量库数据同步...");
//        try {
//            // 执行你写的全量同步业务
//            vectorSyncService.syncAllData();
//            log.info("✅ 向量库数据同步完成！");
//        } catch (Exception e) {
//            log.error("❌ 向量库初始同步失败", e);
//        }
//    }
//}
