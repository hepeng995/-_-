/**
 * 旅游路线 Mock 数据（管理后台）
 */
import type { TourRoute } from '../types';

export const tourRoutes: TourRoute[] = [
  {
    id: 1, name: '田园经典一日游', coverImage: 'https://picsum.photos/seed/route1/600/400',
    description: '畅游田园生态景区，感受陶渊明笔下的绿水青山。', days: 1,
    difficulty: 'easy', suitableCrowd: '家庭出游', budgetMin: 200, budgetMax: 500,
    tags: ['自然风光', '人文历史', '美食体验'], viewCount: 3280, rating: 4.9, ratingCount: 328,
    isOfficial: true, status: 1,
    items: [
      { dayNumber: 1, sortOrder: 1, attractionId: 1, suggestedDuration: '3小时', transportMethod: '步行', note: '建议上午9点入园' },
      { dayNumber: 1, sortOrder: 2, attractionId: 5, suggestedDuration: '2小时', transportMethod: '驾车15分钟', note: '午餐可在农家乐解决' },
      { dayNumber: 1, sortOrder: 3, attractionId: 2, suggestedDuration: '2小时', transportMethod: '驾车20分钟', note: '傍晚可看日落' }
    ]
  },
  {
    id: 2, name: '山水秘境两日游', coverImage: 'https://picsum.photos/seed/route2/600/400',
    description: '深入乡村秘境，探索不为人知的山水奇观。', days: 2,
    difficulty: 'medium', suitableCrowd: '户外爱好者', budgetMin: 500, budgetMax: 1000,
    tags: ['探险', '自然风光', '户外运动'], viewCount: 2156, rating: 4.7, ratingCount: 186,
    isOfficial: true, status: 1,
    items: [
      { dayNumber: 1, sortOrder: 1, attractionId: 4, suggestedDuration: '4小时', transportMethod: '驾车40分钟', note: '穿舒适运动鞋' },
      { dayNumber: 1, sortOrder: 2, attractionId: 5, suggestedDuration: '2小时', transportMethod: '驾车30分钟', note: '晚餐住宿推荐附近民宿' },
      { dayNumber: 2, sortOrder: 1, attractionId: 3, suggestedDuration: '5小时', transportMethod: '驾车50分钟', note: '山顶可远眺碧江' },
      { dayNumber: 2, sortOrder: 2, attractionId: 2, suggestedDuration: '2小时', transportMethod: '驾车25分钟', note: '返程前溪边休息' }
    ]
  },
  {
    id: 3, name: '亲子研学一日游', coverImage: 'https://picsum.photos/seed/route3/600/400',
    description: '专为亲子家庭设计的研学之旅。', days: 1,
    difficulty: 'easy', suitableCrowd: '亲子家庭', budgetMin: 300, budgetMax: 600,
    tags: ['研学', '亲子', '非遗体验'], viewCount: 1890, rating: 4.8, ratingCount: 245,
    isOfficial: false, status: 1,
    items: [
      { dayNumber: 1, sortOrder: 1, attractionId: 1, suggestedDuration: '2.5小时', transportMethod: '步行', note: '诗词文化长廊' },
      { dayNumber: 1, sortOrder: 2, attractionId: 7, suggestedDuration: '3小时', transportMethod: '驾车20分钟', note: '竹编体验课堂' },
      { dayNumber: 1, sortOrder: 3, attractionId: 5, suggestedDuration: '1.5小时', transportMethod: '驾车15分钟', note: '农事体验' }
    ]
  },
  {
    id: 4, name: '乡村深度三日游', coverImage: 'https://picsum.photos/seed/route4/600/400',
    description: '用三天时间深入体验乡村的自然与人文。', days: 3,
    difficulty: 'hard', suitableCrowd: '背包客', budgetMin: 800, budgetMax: 1500,
    tags: ['深度游', '自然风光', '温泉', '户外'], viewCount: 1250, rating: 4.6, ratingCount: 98,
    isOfficial: false, status: 1,
    items: [
      { dayNumber: 1, sortOrder: 1, attractionId: 1, suggestedDuration: '4小时', transportMethod: '步行', note: '游览核心景区' },
      { dayNumber: 1, sortOrder: 2, attractionId: 2, suggestedDuration: '2小时', transportMethod: '驾车20分钟', note: '傍晚泛舟' },
      { dayNumber: 2, sortOrder: 1, attractionId: 3, suggestedDuration: '6小时', transportMethod: '驾车60分钟', note: '带足干粮和饮水' },
      { dayNumber: 3, sortOrder: 1, attractionId: 7, suggestedDuration: '2小时', transportMethod: '驾车40分钟', note: '漫步竹海' },
      { dayNumber: 3, sortOrder: 2, attractionId: 8, suggestedDuration: '3小时', transportMethod: '驾车30分钟', note: '泡温泉放松' }
    ]
  },
  {
    id: 5, name: '古村文化两日游', coverImage: 'https://picsum.photos/seed/route5/600/400',
    description: '探访古村落，感受千年文化底蕴。', days: 2,
    difficulty: 'easy', suitableCrowd: '文化爱好者', budgetMin: 400, budgetMax: 800,
    tags: ['古村文化', '非遗', '美食体验'], viewCount: 1560, rating: 4.8, ratingCount: 167,
    isOfficial: false, status: 1,
    items: [
      { dayNumber: 1, sortOrder: 1, attractionId: 1, suggestedDuration: '3小时', transportMethod: '步行', note: '参观古建筑群' },
      { dayNumber: 1, sortOrder: 2, attractionId: 7, suggestedDuration: '2.5小时', transportMethod: '驾车20分钟', note: '竹编非遗工作室' },
      { dayNumber: 2, sortOrder: 1, attractionId: 6, suggestedDuration: '3小时', transportMethod: '驾车35分钟', note: '四季花海' },
      { dayNumber: 2, sortOrder: 2, attractionId: 5, suggestedDuration: '2小时', transportMethod: '驾车15分钟', note: '乡村美食' }
    ]
  },
  {
    id: 6, name: '生态康养两日游', coverImage: 'https://picsum.photos/seed/route6/600/400',
    description: '逃离城市喧嚣，来乡村享受生态康养之旅。', days: 2,
    difficulty: 'easy', suitableCrowd: '老年人', budgetMin: 600, budgetMax: 1200,
    tags: ['康养', '温泉', '生态'], viewCount: 980, rating: 4.7, ratingCount: 76,
    isOfficial: false, status: 1,
    items: [
      { dayNumber: 1, sortOrder: 1, attractionId: 7, suggestedDuration: '3小时', transportMethod: '驾车30分钟', note: '负氧离子养生' },
      { dayNumber: 1, sortOrder: 2, attractionId: 8, suggestedDuration: '3小时', transportMethod: '驾车25分钟', note: '温泉养生' },
      { dayNumber: 2, sortOrder: 1, attractionId: 4, suggestedDuration: '3小时', transportMethod: '驾车40分钟', note: '轻度徒步' },
      { dayNumber: 2, sortOrder: 2, attractionId: 5, suggestedDuration: '2小时', transportMethod: '驾车20分钟', note: '有机美食' }
    ]
  }
];
