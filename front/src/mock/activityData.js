/**
 * 乡村活动 Mock 数据
 * @description 预置 10 条活动，覆盖 2026 年 4-6 月
 */

// 活动分类配置
export const activityCategories = [
  { key: 'festival', name: '节庆活动', icon: '🎏', color: '#e74c3c' },
  { key: 'picking', name: '采摘体验', icon: '🍓', color: '#27ae60' },
  { key: 'workshop', name: '体验课堂', icon: '🎨', color: '#3498db' },
  { key: 'market', name: '乡村市集', icon: '🏪', color: '#f39c12' },
  { key: 'competition', name: '赛事活动', icon: '🏆', color: '#9b59b6' }
]

// 活动状态配置
export const activityStatusMap = {
  registering: { label: '报名中', color: '#27ae60' },
  full: { label: '已满员', color: '#f39c12' },
  ongoing: { label: '进行中', color: '#3498db' },
  ended: { label: '已结束', color: '#95a5a6' }
}

export const activities = [
  {
    id: 1,
    title: '2026乡村生态文化节',
    coverImages: [
      'https://picsum.photos/seed/act1a/800/500',
      'https://picsum.photos/seed/act1b/800/500',
      'https://picsum.photos/seed/act1c/800/500'
    ],
    description: '一年一度的乡村生态文化节盛大开幕！万亩花海竞相绽放，邀您共赴花海盛宴。活动包含花海摄影大赛、汉服巡游、诗词朗诵、乡村美食品鉴等丰富环节。在这里，您可以穿越千年的诗意，感受田园诗意中的绿水青山。',
    category: 'festival',
    startTime: '2026-04-01 09:00',
    endTime: '2026-04-15 18:00',
    location: '示范县田园生态景区',
    organizer: '示范县文化和旅游局',
    contactPhone: '0736-6688888',
    fee: 0,
    feeText: '免费',
    maxParticipants: 500,
    currentParticipants: 356,
    registrationDeadline: '2026-03-31 23:59',
    status: 'ongoing',
    images: [
      'https://picsum.photos/seed/act1d/400/300',
      'https://picsum.photos/seed/act1e/400/300'
    ],
    tags: ['花海', '摄影', '汉服', '美食'],
    createdAt: '2026-02-15'
  },
  {
    id: 2,
    title: '春日茶园采摘体验',
    coverImages: [
      'https://picsum.photos/seed/act2a/800/500',
      'https://picsum.photos/seed/act2b/800/500'
    ],
    description: '亲手采摘明前茶，体验制茶全过程。在茶庵铺镇的高山茶园中，跟随茶农学习采茶、杀青、揉捻、烘干等传统制茶工艺，最后品尝自己亲手制作的新茶。每位参与者可带走100g自制茶叶。',
    category: 'picking',
    startTime: '2026-04-20 08:00',
    endTime: '2026-04-20 17:00',
    location: '示范县云岭镇高山茶园',
    organizer: '示范县茶叶合作社',
    contactPhone: '0736-6551234',
    fee: 128,
    feeText: '¥128/人',
    maxParticipants: 30,
    currentParticipants: 22,
    registrationDeadline: '2026-04-19 23:59',
    status: 'registering',
    images: [
      'https://picsum.photos/seed/act2c/400/300'
    ],
    tags: ['茶叶', '采摘', '制茶体验'],
    createdAt: '2026-03-01'
  },
  {
    id: 3,
    title: '非遗竹编手作课堂',
    coverImages: [
      'https://picsum.photos/seed/act3a/800/500',
      'https://picsum.photos/seed/act3b/800/500'
    ],
    description: '跟随非遗传承人学习非遗竹编技艺。从选竹、劈篾到编织成型，体验千年竹编文化的魅力。课程结束后，您将拥有一件亲手制作的竹编作品。适合大人和小朋友共同参与。',
    category: 'workshop',
    startTime: '2026-05-10 09:00',
    endTime: '2026-05-10 12:00',
    location: '示范县绿野镇文化站',
    organizer: '示范县非遗保护中心',
    contactPhone: '0736-6623456',
    fee: 68,
    feeText: '¥68/人',
    maxParticipants: 15,
    currentParticipants: 8,
    registrationDeadline: '2026-05-08 23:59',
    status: 'registering',
    images: [],
    tags: ['非遗', '竹编', '手作'],
    createdAt: '2026-03-10'
  },
  {
    id: 4,
    title: '乡村美食市集',
    coverImages: [
      'https://picsum.photos/seed/act4a/800/500',
      'https://picsum.photos/seed/act4b/800/500'
    ],
    description: '五一劳动节特别企划！汇集各乡镇特色美食，擂茶、腊肉、糍粑、米酒……超过50个美食摊位等你来品尝。现场还有厨艺比拼和美食投票环节，参与投票可获精美礼品。',
    category: 'market',
    startTime: '2026-05-01 10:00',
    endTime: '2026-05-03 20:00',
    location: '示范县文化广场',
    organizer: '示范县商务局',
    contactPhone: '0736-6634567',
    fee: 0,
    feeText: '免费',
    maxParticipants: 0,
    currentParticipants: 0,
    registrationDeadline: '',
    status: 'registering',
    images: [],
    tags: ['美食', '市集', '五一'],
    createdAt: '2026-03-15'
  },
  {
    id: 5,
    title: '美丽乡村摄影大赛',
    coverImages: [
      'https://picsum.photos/seed/act5a/800/500'
    ],
    description: '用镜头记录乡村的美丽瞬间。参赛选手需在规定时间内拍摄境内的自然风光、人文景观或乡村生活。设一等奖1名（奖金3000元）、二等奖3名（奖金1000元）、三等奖5名（奖金500元）。',
    category: 'competition',
    startTime: '2026-04-10 00:00',
    endTime: '2026-06-10 23:59',
    location: '示范县全域',
    organizer: '示范县文联',
    contactPhone: '0736-6645678',
    fee: 0,
    feeText: '免费',
    maxParticipants: 200,
    currentParticipants: 156,
    registrationDeadline: '2026-04-09 23:59',
    status: 'ongoing',
    images: [],
    tags: ['摄影', '比赛', '风光'],
    createdAt: '2026-03-05'
  },
  {
    id: 6,
    title: '油菜花海写生营',
    coverImages: [
      'https://picsum.photos/seed/act6a/800/500',
      'https://picsum.photos/seed/act6b/800/500'
    ],
    description: '在金灿灿的油菜花海中挥洒画笔，捕捉春天的色彩。专业美术老师现场指导，提供全套画材。优秀作品将在示范县文化馆展出一个月。适合所有绘画爱好者。',
    category: 'workshop',
    startTime: '2026-04-25 09:00',
    endTime: '2026-04-25 16:00',
    location: '示范县枫林花海景区',
    organizer: '示范县美术家协会',
    contactPhone: '0736-6656789',
    fee: 98,
    feeText: '¥98/人',
    maxParticipants: 20,
    currentParticipants: 14,
    registrationDeadline: '2026-04-23 23:59',
    status: 'registering',
    images: [],
    tags: ['写生', '油菜花', '美术'],
    createdAt: '2026-03-20'
  },
  {
    id: 7,
    title: '端午龙舟文化节',
    coverImages: [
      'https://picsum.photos/seed/act7a/800/500',
      'https://picsum.photos/seed/act7b/800/500'
    ],
    description: '端午佳节，沅江之上龙舟竞渡！观赏激烈的龙舟比赛，参与包粽子、编五彩绳、挂艾草等传统端午民俗活动。现场还有屈原诗词朗诵会和端午文化展览。',
    category: 'festival',
    startTime: '2026-05-31 08:00',
    endTime: '2026-05-31 18:00',
    location: '示范县碧江段',
    organizer: '示范县体育局',
    contactPhone: '0736-6667890',
    fee: 0,
    feeText: '免费',
    maxParticipants: 1000,
    currentParticipants: 234,
    registrationDeadline: '2026-05-29 23:59',
    status: 'registering',
    images: [],
    tags: ['端午', '龙舟', '民俗'],
    createdAt: '2026-04-01'
  },
  {
    id: 8,
    title: '杨梅采摘季',
    coverImages: [
      'https://picsum.photos/seed/act8a/800/500'
    ],
    description: '六月杨梅成熟时，来乡村体验亲手采摘的乐趣。满山红透的杨梅等你来摘，酸甜可口的杨梅让你回味无穷。采摘的杨梅可现场制作杨梅酒或带回家。',
    category: 'picking',
    startTime: '2026-06-01 08:00',
    endTime: '2026-06-15 17:00',
    location: '示范县太平乡杨梅基地',
    organizer: '示范县农业农村局',
    contactPhone: '0736-6678901',
    fee: 58,
    feeText: '¥58/人',
    maxParticipants: 50,
    currentParticipants: 12,
    registrationDeadline: '2026-05-30 23:59',
    status: 'registering',
    images: [],
    tags: ['杨梅', '采摘', '水果'],
    createdAt: '2026-04-10'
  },
  {
    id: 9,
    title: '乡村马拉松赛',
    coverImages: [
      'https://picsum.photos/seed/act9a/800/500',
      'https://picsum.photos/seed/act9b/800/500'
    ],
    description: '在乡村的田园风光中奔跑，体验不一样的马拉松。赛道途经田园生态景区、夷望溪、竹海等美景，设全程马拉松、半程马拉松和迷你跑三个组别。完赛选手可获得定制奖牌。',
    category: 'competition',
    startTime: '2026-05-17 07:00',
    endTime: '2026-05-17 14:00',
    location: '示范县城至田园生态景区',
    organizer: '示范县体育局',
    contactPhone: '0736-6689012',
    fee: 50,
    feeText: '¥50/人',
    maxParticipants: 300,
    currentParticipants: 189,
    registrationDeadline: '2026-05-10 23:59',
    status: 'registering',
    images: [],
    tags: ['马拉松', '跑步', '健身'],
    createdAt: '2026-03-25'
  },
  {
    id: 10,
    title: '手工陶艺体验日',
    coverImages: [
      'https://picsum.photos/seed/act10a/800/500',
      'https://picsum.photos/seed/act10b/800/500'
    ],
    description: '在专业陶艺师的指导下，体验从揉泥、拉坯到上釉的全过程。您可以制作属于自己的茶杯、花瓶或小摆件。作品烧制完成后可邮寄到家。亲子家庭特别优惠。',
    category: 'workshop',
    startTime: '2026-06-07 09:30',
    endTime: '2026-06-07 16:30',
    location: '示范县文创产业园陶艺工坊',
    organizer: '示范县文创协会',
    contactPhone: '0736-6690123',
    fee: 88,
    feeText: '¥88/人',
    maxParticipants: 12,
    currentParticipants: 5,
    registrationDeadline: '2026-06-05 23:59',
    status: 'registering',
    images: [],
    tags: ['陶艺', '手作', '文创'],
    createdAt: '2026-04-15'
  }
]

// 模拟报名数据
export const registrations = [
  { id: 1, activityId: 2, contactName: '张三', contactPhone: '13800138001', participantCount: 2, remark: '希望安排制茶体验', status: 'confirmed', createdAt: '2026-04-01' },
  { id: 2, activityId: 2, contactName: '李四', contactPhone: '13800138002', participantCount: 1, remark: '', status: 'confirmed', createdAt: '2026-04-02' },
  { id: 3, activityId: 3, contactName: '王五', contactPhone: '13800138003', participantCount: 3, remark: '带两个孩子参加', status: 'pending', createdAt: '2026-04-05' },
  { id: 4, activityId: 5, contactName: '赵六', contactPhone: '13800138004', participantCount: 1, remark: '专业摄影师', status: 'confirmed', createdAt: '2026-04-08' },
  { id: 5, activityId: 9, contactName: '孙七', contactPhone: '13800138005', participantCount: 1, remark: '参加半程', status: 'confirmed', createdAt: '2026-04-10' },
  { id: 6, activityId: 9, contactName: '周八', contactPhone: '13800138006', participantCount: 2, remark: '夫妻一起跑迷你', status: 'pending', createdAt: '2026-04-12' },
  { id: 7, activityId: 10, contactName: '吴九', contactPhone: '13800138007', participantCount: 1, remark: '', status: 'confirmed', createdAt: '2026-04-18' },
  { id: 8, activityId: 7, contactName: '郑十', contactPhone: '13800138008', participantCount: 4, remark: '全家参加', status: 'confirmed', createdAt: '2026-04-20' }
]
