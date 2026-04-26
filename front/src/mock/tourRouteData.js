/**
 * 旅游路线 Mock 数据
 * @description 预置 6 条路线，每条关联 2-4 个景点
 */

// 景点快捷数据（复用现有景点 ID）
const mockAttractions = [
  { id: 1, name: '田园生态景区', coverImage: 'https://picsum.photos/seed/attr1/400/300' },
  { id: 2, name: '夷望溪', coverImage: 'https://picsum.photos/seed/attr2/400/300' },
  { id: 3, name: '星德山', coverImage: 'https://picsum.photos/seed/attr3/400/300' },
  { id: 4, name: '乌云界自然保护区', coverImage: 'https://picsum.photos/seed/attr4/400/300' },
  { id: 5, name: '乡村农家乐', coverImage: 'https://picsum.photos/seed/attr5/400/300' },
  { id: 6, name: '枫林花海', coverImage: 'https://picsum.photos/seed/attr6/400/300' },
  { id: 7, name: '沙坪竹海', coverImage: 'https://picsum.photos/seed/attr7/400/300' },
  { id: 8, name: '热市温泉', coverImage: 'https://picsum.photos/seed/attr8/400/300' }
]

export const tourRoutes = [
  {
    id: 1,
    name: '田园经典一日游',
    coverImage: 'https://picsum.photos/seed/route1/600/400',
    description: '畅游田园生态景区，感受陶渊明笔下的绿水青山。从田园生态景区出发，途经乡村农家乐品尝地道美食，最后在夷望溪畔欣赏绝美日落。一条路线，尽览乡村精华。',
    days: 1,
    difficulty: 'easy',
    difficultyLabel: '简单',
    suitableCrowd: '家庭出游',
    budgetMin: 200,
    budgetMax: 500,
    tags: ['自然风光', '人文历史', '美食体验'],
    viewCount: 3280,
    rating: 4.9,
    ratingCount: 328,
    isOfficial: true,
    status: 1,
    items: [
      {
        dayNumber: 1,
        sortOrder: 1,
        attractionId: 1,
        attractionName: '田园生态景区',
        attractionCover: mockAttractions[0].coverImage,
        suggestedDuration: '3小时',
        transportMethod: '步行',
        note: '建议上午9点入园，避开人流高峰'
      },
      {
        dayNumber: 1,
        sortOrder: 2,
        attractionId: 5,
        attractionName: '乡村农家乐',
        attractionCover: mockAttractions[4].coverImage,
        suggestedDuration: '2小时',
        transportMethod: '驾车15分钟',
        note: '午餐可在农家乐解决，推荐乡村土鸡和擂茶'
      },
      {
        dayNumber: 1,
        sortOrder: 3,
        attractionId: 2,
        attractionName: '夷望溪',
        attractionCover: mockAttractions[1].coverImage,
        suggestedDuration: '2小时',
        transportMethod: '驾车20分钟',
        note: '傍晚可看日落，景色绝佳'
      }
    ]
  },
  {
    id: 2,
    name: '山水秘境两日游',
    coverImage: 'https://picsum.photos/seed/route2/600/400',
    description: '深入乡村秘境，探索不为人知的山水奇观。第一天穿越乌云界原始森林，第二天攀登星德山俯瞰全景。适合热爱自然的户外探险者。',
    days: 2,
    difficulty: 'medium',
    difficultyLabel: '中等',
    suitableCrowd: '户外爱好者',
    budgetMin: 500,
    budgetMax: 1000,
    tags: ['探险', '自然风光', '户外运动'],
    viewCount: 2156,
    rating: 4.7,
    ratingCount: 186,
    isOfficial: true,
    status: 1,
    items: [
      {
        dayNumber: 1,
        sortOrder: 1,
        attractionId: 4,
        attractionName: '乌云界自然保护区',
        attractionCover: mockAttractions[3].coverImage,
        suggestedDuration: '4小时',
        transportMethod: '驾车40分钟',
        note: '建议穿舒适运动鞋，携带防蚊液'
      },
      {
        dayNumber: 1,
        sortOrder: 2,
        attractionId: 5,
        attractionName: '乡村农家乐',
        attractionCover: mockAttractions[4].coverImage,
        suggestedDuration: '2小时',
        transportMethod: '驾车30分钟',
        note: '晚餐住宿推荐附近民宿'
      },
      {
        dayNumber: 2,
        sortOrder: 1,
        attractionId: 3,
        attractionName: '星德山',
        attractionCover: mockAttractions[2].coverImage,
        suggestedDuration: '5小时',
        transportMethod: '驾车50分钟',
        note: '山势较陡，注意安全。山顶可远眺沅江'
      },
      {
        dayNumber: 2,
        sortOrder: 2,
        attractionId: 2,
        attractionName: '夷望溪',
        attractionCover: mockAttractions[1].coverImage,
        suggestedDuration: '2小时',
        transportMethod: '驾车25分钟',
        note: '返程前可在溪边休息，品一杯高山擂茶'
      }
    ]
  },
  {
    id: 3,
    name: '亲子研学一日游',
    coverImage: 'https://picsum.photos/seed/route3/600/400',
    description: '专为亲子家庭设计的研学之旅。在田园生态景区感受传统文化，于沙坪竹海学习竹编技艺，让孩子在游玩中学习，在实践中成长。',
    days: 1,
    difficulty: 'easy',
    difficultyLabel: '简单',
    suitableCrowd: '亲子家庭',
    budgetMin: 300,
    budgetMax: 600,
    tags: ['研学', '亲子', '非遗体验'],
    viewCount: 1890,
    rating: 4.8,
    ratingCount: 245,
    isOfficial: false,
    status: 1,
    items: [
      {
        dayNumber: 1,
        sortOrder: 1,
        attractionId: 1,
        attractionName: '田园生态景区',
        attractionCover: mockAttractions[0].coverImage,
        suggestedDuration: '2.5小时',
        transportMethod: '步行',
        note: '景区有陶渊明诗词文化长廊，适合亲子互动'
      },
      {
        dayNumber: 1,
        sortOrder: 2,
        attractionId: 7,
        attractionName: '沙坪竹海',
        attractionCover: mockAttractions[6].coverImage,
        suggestedDuration: '3小时',
        transportMethod: '驾车20分钟',
        note: '可参加竹编体验课堂，亲手制作竹编小物件'
      },
      {
        dayNumber: 1,
        sortOrder: 3,
        attractionId: 5,
        attractionName: '乡村农家乐',
        attractionCover: mockAttractions[4].coverImage,
        suggestedDuration: '1.5小时',
        transportMethod: '驾车15分钟',
        note: '可参与农事体验，如采摘蔬菜、喂养小动物'
      }
    ]
  },
  {
    id: 4,
    name: '乡村深度三日游',
    coverImage: 'https://picsum.photos/seed/route4/600/400',
    description: '用三天时间深入体验乡村的自然与人文。从田园生态景区到星德山，从竹海到温泉，全方位感受乡村魅力。适合时间充裕的背包客。',
    days: 3,
    difficulty: 'hard',
    difficultyLabel: '困难',
    suitableCrowd: '背包客',
    budgetMin: 800,
    budgetMax: 1500,
    tags: ['深度游', '自然风光', '温泉', '户外'],
    viewCount: 1250,
    rating: 4.6,
    ratingCount: 98,
    isOfficial: false,
    status: 1,
    items: [
      {
        dayNumber: 1,
        sortOrder: 1,
        attractionId: 1,
        attractionName: '田园生态景区',
        attractionCover: mockAttractions[0].coverImage,
        suggestedDuration: '4小时',
        transportMethod: '步行',
        note: '第一天慢慢游览田园生态景区核心区'
      },
      {
        dayNumber: 1,
        sortOrder: 2,
        attractionId: 2,
        attractionName: '夷望溪',
        attractionCover: mockAttractions[1].coverImage,
        suggestedDuration: '2小时',
        transportMethod: '驾车20分钟',
        note: '傍晚泛舟溪上，欣赏夕阳'
      },
      {
        dayNumber: 2,
        sortOrder: 1,
        attractionId: 3,
        attractionName: '星德山',
        attractionCover: mockAttractions[2].coverImage,
        suggestedDuration: '6小时',
        transportMethod: '驾车60分钟',
        note: '全天登山，注意带足干粮和饮水'
      },
      {
        dayNumber: 3,
        sortOrder: 1,
        attractionId: 7,
        attractionName: '沙坪竹海',
        attractionCover: mockAttractions[6].coverImage,
        suggestedDuration: '2小时',
        transportMethod: '驾车40分钟',
        note: '上午漫步竹海，呼吸清新空气'
      },
      {
        dayNumber: 3,
        sortOrder: 2,
        attractionId: 8,
        attractionName: '热市温泉',
        attractionCover: mockAttractions[7].coverImage,
        suggestedDuration: '3小时',
        transportMethod: '驾车30分钟',
        note: '下午泡温泉放松，完美收官'
      }
    ]
  },
  {
    id: 5,
    name: '古村文化两日游',
    coverImage: 'https://picsum.photos/seed/route5/600/400',
    description: '探访乡村古村落，感受千年文化底蕴。漫步古镇老街，品味传统手工艺，聆听老人口中的乡村故事。一场穿越时光的文化之旅。',
    days: 2,
    difficulty: 'easy',
    difficultyLabel: '简单',
    suitableCrowd: '文化爱好者',
    budgetMin: 400,
    budgetMax: 800,
    tags: ['古村文化', '非遗', '美食体验'],
    viewCount: 1560,
    rating: 4.8,
    ratingCount: 167,
    isOfficial: false,
    status: 1,
    items: [
      {
        dayNumber: 1,
        sortOrder: 1,
        attractionId: 1,
        attractionName: '田园生态景区',
        attractionCover: mockAttractions[0].coverImage,
        suggestedDuration: '3小时',
        transportMethod: '步行',
        note: '了解田园生态景区历史文化，参观古建筑群'
      },
      {
        dayNumber: 1,
        sortOrder: 2,
        attractionId: 7,
        attractionName: '沙坪竹海',
        attractionCover: mockAttractions[6].coverImage,
        suggestedDuration: '2.5小时',
        transportMethod: '驾车20分钟',
        note: '参观竹编非遗传承人工作室'
      },
      {
        dayNumber: 2,
        sortOrder: 1,
        attractionId: 6,
        attractionName: '枫林花海',
        attractionCover: mockAttractions[5].coverImage,
        suggestedDuration: '3小时',
        transportMethod: '驾车35分钟',
        note: '四季花海，拍照打卡圣地'
      },
      {
        dayNumber: 2,
        sortOrder: 2,
        attractionId: 5,
        attractionName: '乡村农家乐',
        attractionCover: mockAttractions[4].coverImage,
        suggestedDuration: '2小时',
        transportMethod: '驾车15分钟',
        note: '品尝正宗乡村美食，体验传统擂茶制作'
      }
    ]
  },
  {
    id: 6,
    name: '生态康养两日游',
    coverImage: 'https://picsum.photos/seed/route6/600/400',
    description: '逃离城市喧嚣，来乡村享受生态康养之旅。漫步竹海呼吸负氧离子，泡温泉舒缓身心，品农家有机美食。适合追求健康生活的您。',
    days: 2,
    difficulty: 'easy',
    difficultyLabel: '简单',
    suitableCrowd: '老年人',
    budgetMin: 600,
    budgetMax: 1200,
    tags: ['康养', '温泉', '生态'],
    viewCount: 980,
    rating: 4.7,
    ratingCount: 76,
    isOfficial: false,
    status: 1,
    items: [
      {
        dayNumber: 1,
        sortOrder: 1,
        attractionId: 7,
        attractionName: '沙坪竹海',
        attractionCover: mockAttractions[6].coverImage,
        suggestedDuration: '3小时',
        transportMethod: '驾车30分钟',
        note: '负氧离子含量极高，适合养生呼吸'
      },
      {
        dayNumber: 1,
        sortOrder: 2,
        attractionId: 8,
        attractionName: '热市温泉',
        attractionCover: mockAttractions[7].coverImage,
        suggestedDuration: '3小时',
        transportMethod: '驾车25分钟',
        note: '温泉含多种矿物质，有养生功效'
      },
      {
        dayNumber: 2,
        sortOrder: 1,
        attractionId: 4,
        attractionName: '乌云界自然保护区',
        attractionCover: mockAttractions[3].coverImage,
        suggestedDuration: '3小时',
        transportMethod: '驾车40分钟',
        note: '轻度徒步路线，沿木栈道观赏自然生态'
      },
      {
        dayNumber: 2,
        sortOrder: 2,
        attractionId: 5,
        attractionName: '乡村农家乐',
        attractionCover: mockAttractions[4].coverImage,
        suggestedDuration: '2小时',
        transportMethod: '驾车20分钟',
        note: '品尝有机蔬菜和生态养殖的土鸡'
      }
    ]
  }
]

export const difficultyMap = {
  easy: { label: '简单', color: '#10b981' },
  medium: { label: '中等', color: '#f59e0b' },
  hard: { label: '困难', color: '#ef4444' }
}
