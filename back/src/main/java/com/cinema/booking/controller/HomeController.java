package com.cinema.booking.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cinema.booking.dto.AttractionDTO;
import com.cinema.booking.dto.CategoryDTO;
import com.cinema.booking.dto.NewsDTO;
import com.cinema.booking.dto.ProductDTO;
import com.cinema.booking.entity.Attraction;
import com.cinema.booking.entity.News;
import com.cinema.booking.entity.Order;
import com.cinema.booking.entity.Product;
import com.cinema.booking.mapper.AttractionMapper;
import com.cinema.booking.mapper.NewsMapper;
import com.cinema.booking.mapper.OrderMapper;
import com.cinema.booking.mapper.ProductMapper;
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
    private final AttractionMapper attractionMapper;
    private final ProductMapper productMapper;
    private final NewsMapper newsMapper;
    private final OrderMapper orderMapper;
    
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

    @Operation(summary = "获取首页轮播图")
    @GetMapping("/banners")
    public Result<List<Map<String, Object>>> getBanners() {
        List<Map<String, Object>> banners = new ArrayList<>();

        attractionService.getRecommendAttractions(1).stream().findFirst().ifPresent(item ->
                banners.add(Map.of(
                        "image", item.getCoverImage(),
                        "title", item.getName(),
                        "subtitle", truncate(item.getDescription(), 28),
                        "path", "/attractions/" + item.getId(),
                        "buttonText", "查看景点"
                )));

        productService.getFeaturedProducts(1).stream().findFirst().ifPresent(item ->
                banners.add(Map.of(
                        "image", item.getCoverImage(),
                        "title", item.getName(),
                        "subtitle", truncate(item.getDescription(), 28),
                        "path", "/products/" + item.getId(),
                        "buttonText", "进入商城"
                )));

        newsService.getFeaturedNews(2).forEach(item ->
                banners.add(Map.of(
                        "image", item.getCoverImage(),
                        "title", item.getTitle(),
                        "subtitle", truncate(item.getSummary(), 28),
                        "path", "/news/" + item.getId(),
                        "buttonText", "查看资讯"
                )));

        return Result.ok(banners);
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
        overview.setAttractionCount(Math.toIntExact(countAttractions()));
        overview.setProductCount(Math.toIntExact(countProducts()));
        overview.setNewsCount(Math.toIntExact(countNews()));

        return Result.ok(overview);
    }

    @Operation(summary = "获取首页统计数据")
    @GetMapping("/stats")
    public Result<Map<String, Object>> getHomeStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("attractionCount", countAttractions());
        stats.put("productCount", countProducts());
        stats.put("newsCount", countNews());
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
            
            int attractionCount = getCountByDateRange("attractions", dayStart, dayEnd);
            attractionData.add(attractionCount);
            int productCount = getCountByDateRange("products", dayStart, dayEnd);
            productData.add(productCount);
            int orderCount = getCountByDateRange("orders", dayStart, dayEnd);
            orderData.add(orderCount);
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
        switch (table) {
            case "attractions":
                return Math.toIntExact(attractionMapper.selectCount(
                        new LambdaQueryWrapper<Attraction>()
                                .eq(Attraction::getDeleted, false)
                                .between(Attraction::getCreatedAt, start, end)
                ));
            case "products":
                return Math.toIntExact(productMapper.selectCount(
                        new LambdaQueryWrapper<Product>()
                                .eq(Product::getDeleted, false)
                                .between(Product::getCreatedAt, start, end)
                ));
            case "orders":
                return Math.toIntExact(orderMapper.selectCount(
                        new LambdaQueryWrapper<Order>()
                                .eq(Order::getDeleted, false)
                                .between(Order::getCreatedAt, start, end)
                ));
            case "news":
                return Math.toIntExact(newsMapper.selectCount(
                        new LambdaQueryWrapper<News>()
                                .eq(News::getDeleted, false)
                                .between(News::getCreatedAt, start, end)
                ));
            default:
                return 0;
        }
    }

    private long countAttractions() {
        return attractionMapper.selectCount(new LambdaQueryWrapper<Attraction>()
                .eq(Attraction::getDeleted, false)
                .eq(Attraction::getStatus, 1));
    }

    private long countProducts() {
        return productMapper.selectCount(new LambdaQueryWrapper<Product>()
                .eq(Product::getDeleted, false)
                .eq(Product::getStatus, 1));
    }

    private long countNews() {
        return newsMapper.selectCount(new LambdaQueryWrapper<News>()
                .eq(News::getDeleted, false)
                .eq(News::getStatus, 1));
    }

    private String truncate(String text, int maxLength) {
        if (text == null || text.isBlank()) {
            return "查看平台精选内容";
        }
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + "...";
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
