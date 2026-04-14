package com.cinema.booking;

import com.cinema.booking.service.ai.impl.VectorSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 乡村振兴·新桃源智界系统启动类
 */
@SpringBootApplication
@EnableTransactionManagement
@MapperScan("com.cinema.booking.mapper")
@EnableAspectJAutoProxy
@Slf4j
@RequiredArgsConstructor
public class CinemaBookingApplication {
//    private final VectorSyncService vectorSyncService; // 注入同步服务

    public static void main(String[] args) {
        SpringApplication.run(CinemaBookingApplication.class, args);
    }
//    @Override
//    public void run(String... args) { // 实现 run 方法
//        log.info("🚀 项目启动完成，开始自动同步数据到向量数据库...");
//
//        try {
//            vectorSyncService.syncAllData();
//            log.info("✅ 启动时数据同步完成！");
//        } catch (Exception e) {
//            log.error("❌ 启动时数据同步失败：", e);
//        }
//    }
}
