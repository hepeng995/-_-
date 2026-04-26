package com.cinema.booking;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 乡村振兴·智兴乡村平台系统启动类
 */
@SpringBootApplication
@EnableTransactionManagement
@MapperScan("com.cinema.booking.mapper")
@EnableAspectJAutoProxy
@Slf4j
@RequiredArgsConstructor
public class CinemaBookingApplication{

    public static void main(String[] args) {
        SpringApplication.run(CinemaBookingApplication.class, args);
    }

}
