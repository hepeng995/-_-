package com.cinema.booking.controller;

import com.cinema.booking.dto.AttractionDTO;
import com.cinema.booking.dto.CategoryDTO;
import com.cinema.booking.dto.NewsDTO;
import com.cinema.booking.dto.ProductDTO;
import com.cinema.booking.service.AttractionService;
import com.cinema.booking.service.NewsService;
import com.cinema.booking.service.OrderService;
import com.cinema.booking.service.ProductService;
import com.cinema.booking.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 首页控制器
 */
@Tag(name = "首页接口", description = "首页相关数据接口")
@RestController
@RequestMapping("/home")
@RequiredArgsConstructor
public class HomeController {
    
    private final AttractionService attractionService;
    private final ProductService productService;
    private final NewsService newsService;
    private final OrderService orderService;
    
    @Operation(summary = "获取首页数据")
    @GetMapping("/data")
    public Result<HomeDataVO> getHomeData() {
        HomeDataVO homeData = new HomeDataVO();
        
        // 获取推荐景点
        homeData.setRecommendAttractions(attractionService.getRecommendAttractions(6));
        
        // 获取热门景点
        homeData.setHotAttractions(attractionService.getHotAttractions(6));
        
        // 获取景点分类
        homeData.setAttractionCategories(attractionService.getAttractionCategories());
        
        // 获取推荐商品
        homeData.setFeaturedProducts(productService.getFeaturedProducts(8));
        
        // 获取热销商品
        homeData.setHotProducts(productService.getHotProducts(8));
        
        // 获取商品分类
        homeData.setProductCategories(productService.getProductCategories());
        
        // 获取置顶资讯
        homeData.setTopNews(newsService.getTopNews(3));
        
        // 获取推荐资讯
        homeData.setFeaturedNews(newsService.getFeaturedNews(6));
        
        // 获取各分类资讯
        homeData.setLatestNews(newsService.getNewsByCategory("news", 4));
        homeData.setLatestPolicies(newsService.getNewsByCategory("policy", 4));
        homeData.setLatestActivities(newsService.getNewsByCategory("activity", 4));
        
        return Result.ok(homeData);
    }
    
    @Operation(summary = "获取乡村概览数据")
    @GetMapping("/overview")
    public Result<VillageOverviewVO> getVillageOverview() {
        VillageOverviewVO overview = new VillageOverviewVO();
        
        // 这里可以设置一些静态的乡村介绍数据
        overview.setTitle("乡村振兴·智兴乡村平台");
        overview.setSubtitle("绿水青山就是金山银山，现代科技赋能的智慧乡村");
        overview.setDescription("这里有繁花似锦的春天，绿荫如盖的夏日，硕果累累的秋季，雪梅傲骨的冬时。" +
                "我们致力于打造集自然风光、人文历史、现代农业、智慧旅游于一体的美丽乡村。");
        
        overview.setHonors(List.of(
                "全国乡村振兴示范县",
                "国家AAA级旅游景区",
                "全国文明村镇",
                "美丽乡村建设示范点"
        ));
        
        overview.setFeatures(List.of(
                "生态宜居环境优美",
                "产业兴旺特色突出", 
                "乡风文明传承有序",
                "治理有效服务便民",
                "生活富裕共同富裕"
        ));
        
        // 统计数据
        overview.setAttractionCount(attractionService.getRecommendAttractions(999).size());
        overview.setProductCount(productService.getFeaturedProducts(999).size());
        overview.setNewsCount(newsService.getFeaturedNews(999).size());

        return Result.ok(overview);
    }

    @Operation(summary = "获取首页统计数据")
    @GetMapping("/stats")
    public Result<Map<String, Object>> getHomeStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("attractionCount", attractionService.getRecommendAttractions(9999).size());
        stats.put("productCount", productService.getFeaturedProducts(9999).size());
        stats.put("newsCount", newsService.getFeaturedNews(9999).size());
        stats.put("orderCount", orderService.getOrderStats().getTotalOrders());
        return Result.ok(stats);
    }

    @Operation(summary = "获取数据趋势统计")
    @GetMapping("/trend-data")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getTrendData(@RequestParam(defaultValue = "7") Integer days) {
        Map<String, Object> trendData = new HashMap<>();
        
        // 根据天数计算开始时间
        LocalDateTime startTime = LocalDateTime.now().minusDays(days);
        LocalDateTime endTime = LocalDateTime.now();
        
        // 生成日期列表
        List<String> dateLabels = new ArrayList<>();
        List<Integer> attractionData = new ArrayList<>();
        List<Integer> productData = new ArrayList<>();
        List<Integer> orderData = new ArrayList<>();
        List<Integer> newsData = new ArrayList<>();
        
        // 按天统计数据
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime dayStart = LocalDateTime.now().minusDays(i).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd = dayStart.plusDays(1);
            
            // 格式化日期标签
            if (days <= 7) {
                dateLabels.add("第" + (days - i) + "天");
            } else if (days <= 30) {
                dateLabels.add(dayStart.format(DateTimeFormatter.ofPattern("MM-dd")));
            } else {
                dateLabels.add(dayStart.format(DateTimeFormatter.ofPattern("MM-dd")));
            }
            
            // 统计各类数据（这里使用模拟数据，实际项目中应该查询数据库）
            // 景点数据
            int attractionCount = getCountByDateRange("attractions", dayStart, dayEnd);
            attractionData.add(attractionCount);
            
            // 商品数据
            int productCount = getCountByDateRange("products", dayStart, dayEnd);
            productData.add(productCount);
            
            // 订单数据
            int orderCount = getCountByDateRange("orders", dayStart, dayEnd);
            orderData.add(orderCount);
            
            // 资讯数据
            int newsCount = getCountByDateRange("news", dayStart, dayEnd);
            newsData.add(newsCount);
        }
        
        trendData.put("labels", dateLabels);
        trendData.put("attractionData", attractionData);
        trendData.put("productData", productData);
        trendData.put("orderData", orderData);
        trendData.put("newsData", newsData);
        
        return Result.ok(trendData);
    }
    
    private int getCountByDateRange(String table, LocalDateTime start, LocalDateTime end) {
        // 这里使用简化的逻辑，实际项目中应该注入对应的Service并查询数据库
        // 为了演示效果，返回基于时间的模拟数据
        long daysDiff = java.time.Duration.between(start, LocalDateTime.now()).toDays();
        
        switch (table) {
            case "attractions":
                // 景点数据：基础值 + 随机增长
                return (int) (2 + Math.random() * 3 + daysDiff * 0.5);
            case "products":
                // 商品数据：基础值 + 随机增长
                return (int) (5 + Math.random() * 8 + daysDiff * 0.8);
            case "orders":
                // 订单数据：基础值 + 随机增长
                return (int) (3 + Math.random() * 6 + daysDiff * 0.6);
            case "news":
                // 资讯数据：基础值 + 随机增长
                return (int) (1 + Math.random() * 2 + daysDiff * 0.3);
            default:
                return 0;
        }
    }
    
    /**
     * 首页数据VO
     */
    @Data
    public static class HomeDataVO {
        /**
         * 推荐景点
         */
        private List<AttractionDTO> recommendAttractions;
        
        /**
         * 热门景点
         */
        private List<AttractionDTO> hotAttractions;
        
        /**
         * 景点分类
         */
        private List<CategoryDTO> attractionCategories;
        
        /**
         * 推荐商品
         */
        private List<ProductDTO> featuredProducts;
        
        /**
         * 热销商品
         */
        private List<ProductDTO> hotProducts;
        
        /**
         * 商品分类
         */
        private List<CategoryDTO> productCategories;
        
        /**
         * 置顶资讯
         */
        private List<NewsDTO> topNews;
        
        /**
         * 推荐资讯
         */
        private List<NewsDTO> featuredNews;
        
        /**
         * 最新新闻
         */
        private List<NewsDTO> latestNews;
        
        /**
         * 最新政策
         */
        private List<NewsDTO> latestPolicies;
        
        /**
         * 最新活动
         */
        private List<NewsDTO> latestActivities;
    }
    
    /**
     * 乡村概览VO
     */
    @Data
    public static class VillageOverviewVO {
        /**
         * 标题
         */
        private String title;
        
        /**
         * 副标题
         */
        private String subtitle;
        
        /**
         * 描述
         */
        private String description;
        
        /**
         * 荣誉列表
         */
        private List<String> honors;
        
        /**
         * 特色列表
         */
        private List<String> features;
        
        /**
         * 景点数量
         */
        private Integer attractionCount;
        
        /**
         * 商品数量
         */
        private Integer productCount;
        
        /**
         * 资讯数量
         */
        private Integer newsCount;
    }
}
