/**
 * 乡村活动 Mock 数据（管理后台）
 */
import type { Activity, ActivityRegistration } from '../types';

export const activityCategories = [
  { key: 'festival', name: '节庆活动', color: '#C05638' },
  { key: 'picking', name: '采摘体验', color: '#3A9B5B' },
  { key: 'workshop', name: '体验课堂', color: '#4A8FA8' },
  { key: 'market', name: '乡村市集', color: '#D49E42' },
  { key: 'competition', name: '赛事活动', color: '#7C5CBF' }
];

export const activities: Activity[] = [
  { id: 1, title: '2026乡村生态文化节', coverImages: ['https://picsum.photos/seed/act1a/800/500'], description: '一年一度的乡村生态文化节盛大开幕！', category: 'festival', startTime: '2026-04-01 09:00', endTime: '2026-04-15 18:00', location: '乡村振兴示范县生态景区', organizer: '示范县文化和旅游局', contactPhone: '0736-6688888', fee: 0, maxParticipants: 500, currentParticipants: 356, registrationDeadline: '2026-03-31 23:59', status: 'ongoing', images: [], tags: ['赏花', '摄影'], createdAt: '2026-02-15' },
  { id: 2, title: '春日茶园采摘体验', coverImages: ['https://picsum.photos/seed/act2a/800/500'], description: '亲手采摘明前茶，体验制茶全过程。', category: 'picking', startTime: '2026-04-20 08:00', endTime: '2026-04-20 17:00', location: '乡村振兴示范县云岭镇高山茶园', organizer: '示范县茶叶合作社', contactPhone: '0736-6551234', fee: 128, maxParticipants: 30, currentParticipants: 22, registrationDeadline: '2026-04-19 23:59', status: 'registering', images: [], tags: ['茶叶', '采摘'], createdAt: '2026-03-01' },
  { id: 3, title: '非遗竹编手作课堂', coverImages: ['https://picsum.photos/seed/act3a/800/500'], description: '跟随非遗传承人学习非遗竹编技艺。', category: 'workshop', startTime: '2026-05-10 09:00', endTime: '2026-05-10 12:00', location: '乡村振兴示范县绿野镇文化站', organizer: '示范县非遗保护中心', contactPhone: '0736-6623456', fee: 68, maxParticipants: 15, currentParticipants: 8, registrationDeadline: '2026-05-08 23:59', status: 'registering', images: [], tags: ['非遗', '竹编'], createdAt: '2026-03-10' },
  { id: 4, title: '乡村美食市集', coverImages: ['https://picsum.photos/seed/act4a/800/500'], description: '五一劳动节特别企划！汇集各乡镇特色美食。', category: 'market', startTime: '2026-05-01 10:00', endTime: '2026-05-03 20:00', location: '示范县文化广场', organizer: '示范县商务局', contactPhone: '0736-6634567', fee: 0, maxParticipants: 0, currentParticipants: 0, registrationDeadline: '', status: 'registering', images: [], tags: ['美食', '市集'], createdAt: '2026-03-15' },
  { id: 5, title: '美丽乡村摄影大赛', coverImages: ['https://picsum.photos/seed/act5a/800/500'], description: '用镜头记录乡村的美丽瞬间。', category: 'competition', startTime: '2026-04-10 00:00', endTime: '2026-06-10 23:59', location: '示范县全域', organizer: '示范县文联', contactPhone: '0736-6645678', fee: 0, maxParticipants: 200, currentParticipants: 156, registrationDeadline: '2026-04-09 23:59', status: 'ongoing', images: [], tags: ['摄影', '比赛'], createdAt: '2026-03-05' },
  { id: 6, title: '油菜花海写生营', coverImages: ['https://picsum.photos/seed/act6a/800/500'], description: '在金灿灿的油菜花海中挥洒画笔。', category: 'workshop', startTime: '2026-04-25 09:00', endTime: '2026-04-25 16:00', location: '乡村振兴示范县枫林花海景区', organizer: '示范县美术家协会', contactPhone: '0736-6656789', fee: 98, maxParticipants: 20, currentParticipants: 14, registrationDeadline: '2026-04-23 23:59', status: 'registering', images: [], tags: ['写生', '油菜花'], createdAt: '2026-03-20' },
  { id: 7, title: '端午龙舟文化节', coverImages: ['https://picsum.photos/seed/act7a/800/500'], description: '端午佳节，碧江之上龙舟竞渡！', category: 'festival', startTime: '2026-05-31 08:00', endTime: '2026-05-31 18:00', location: '乡村振兴示范县碧江段', organizer: '示范县体育局', contactPhone: '0736-6667890', fee: 0, maxParticipants: 1000, currentParticipants: 234, registrationDeadline: '2026-05-29 23:59', status: 'registering', images: [], tags: ['端午', '龙舟'], createdAt: '2026-04-01' },
  { id: 8, title: '杨梅采摘季', coverImages: ['https://picsum.photos/seed/act8a/800/500'], description: '六月杨梅成熟时，来乡村体验采摘的乐趣。', category: 'picking', startTime: '2026-06-01 08:00', endTime: '2026-06-15 17:00', location: '乡村振兴示范县太平乡杨梅基地', organizer: '示范县农业农村局', contactPhone: '0736-6678901', fee: 58, maxParticipants: 50, currentParticipants: 12, registrationDeadline: '2026-05-30 23:59', status: 'registering', images: [], tags: ['杨梅', '采摘'], createdAt: '2026-04-10' },
  { id: 9, title: '乡村马拉松赛', coverImages: ['https://picsum.photos/seed/act9a/800/500'], description: '在田园风光中奔跑。', category: 'competition', startTime: '2026-05-17 07:00', endTime: '2026-05-17 14:00', location: '乡村振兴示范县城至生态景区', organizer: '示范县体育局', contactPhone: '0736-6689012', fee: 50, maxParticipants: 300, currentParticipants: 189, registrationDeadline: '2026-05-10 23:59', status: 'registering', images: [], tags: ['马拉松', '跑步'], createdAt: '2026-03-25' },
  { id: 10, title: '手工陶艺体验日', coverImages: ['https://picsum.photos/seed/act10a/800/500'], description: '在专业陶艺师的指导下体验制陶全流程。', category: 'workshop', startTime: '2026-06-07 09:30', endTime: '2026-06-07 16:30', location: '示范县文创产业园陶艺工坊', organizer: '示范县文创协会', contactPhone: '0736-6690123', fee: 88, maxParticipants: 12, currentParticipants: 5, registrationDeadline: '2026-06-05 23:59', status: 'registering', images: [], tags: ['陶艺', '手作'], createdAt: '2026-04-15' }
];

export const registrations: ActivityRegistration[] = [
  { id: 1, activityId: 2, activityTitle: '春日茶园采摘体验', contactName: '张三', contactPhone: '13800138001', participantCount: 2, remark: '希望安排制茶体验', status: 'confirmed', createdAt: '2026-04-01' },
  { id: 2, activityId: 2, activityTitle: '春日茶园采摘体验', contactName: '李四', contactPhone: '13800138002', participantCount: 1, remark: '', status: 'confirmed', createdAt: '2026-04-02' },
  { id: 3, activityId: 3, activityTitle: '非遗竹编手作课堂', contactName: '王五', contactPhone: '13800138003', participantCount: 3, remark: '带两个孩子参加', status: 'pending', createdAt: '2026-04-05' },
  { id: 4, activityId: 5, activityTitle: '美丽乡村摄影大赛', contactName: '赵六', contactPhone: '13800138004', participantCount: 1, remark: '专业摄影师', status: 'confirmed', createdAt: '2026-04-08' },
  { id: 5, activityId: 9, activityTitle: '乡村马拉松赛', contactName: '孙七', contactPhone: '13800138005', participantCount: 1, remark: '参加半程', status: 'confirmed', createdAt: '2026-04-10' },
  { id: 6, activityId: 9, activityTitle: '乡村马拉松赛', contactName: '周八', contactPhone: '13800138006', participantCount: 2, remark: '夫妻一起跑迷你', status: 'pending', createdAt: '2026-04-12' },
  { id: 7, activityId: 10, activityTitle: '手工陶艺体验日', contactName: '吴九', contactPhone: '13800138007', participantCount: 1, remark: '', status: 'confirmed', createdAt: '2026-04-18' },
  { id: 8, activityId: 7, activityTitle: '端午龙舟文化节', contactName: '郑十', contactPhone: '13800138008', participantCount: 4, remark: '全家参加', status: 'confirmed', createdAt: '2026-04-20' }
];
