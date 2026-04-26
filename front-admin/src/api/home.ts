import request from './request';
import type { HomeData, HomeStats, HomeOverview } from '../types';

/** 获取首页所有数据 */
export function getHomeData() {
  return request.get<HomeData>('/home/data');
}

/** 获取首页概览信息 */
export function getOverview() {
  return request.get<HomeOverview>('/home/overview');
}

/** 获取首页统计数据 */
export function getHomeStats() {
  return request.get<HomeStats>('/home/stats');
}

/** 获取首页轮播图 */
export function getBanners() {
  return request.get<any[]>('/home/banners');
}

export default { getHomeData, getOverview, getHomeStats, getBanners };
