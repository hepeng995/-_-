import request from './request';
import type { SystemConfig } from '../types';

/** 获取所有系统配置 */
export function getAllConfigs() {
  return request.get<SystemConfig[]>('/system/config/list');
}

/** 按分组获取系统配置 */
export function getConfigsByGroup() {
  return request.get<Record<string, SystemConfig[]>>('/system/config/group');
}

/** 获取指定分组的配置 */
export function getConfigsByGroupName(groupName: string) {
  return request.get<SystemConfig[]>(`/system/config/group/${groupName}`);
}

/** 获取所有配置分组 */
export function getAllGroups() {
  return request.get<string[]>('/system/config/groups');
}

/** 根据键名获取配置 */
export function getConfigByKey(configKey: string) {
  return request.get<SystemConfig>(`/system/config/${configKey}`);
}

/** 新增配置 */
export function addConfig(data: Partial<SystemConfig>) {
  return request.post<void>('/system/config', data);
}

/** 更新配置 */
export function updateConfig(data: Partial<SystemConfig>) {
  return request.put<void>('/system/config', data);
}

/** 更新配置值 */
export function updateConfigValue(configKey: string, configValue: string) {
  return request.put<void>(`/system/config/${configKey}`, null, { params: { configValue } });
}

/** 批量更新配置值 */
export function batchUpdateConfigValues(data: Record<string, string>) {
  return request.put<void>('/system/config/batch', data);
}

/** 删除配置 */
export function deleteConfig(id: number) {
  return request.delete<void>(`/system/config/${id}`);
}

/** 刷新配置缓存 */
export function refreshCache() {
  return request.post<void>('/system/config/refresh');
}

export default {
  getAllConfigs, getConfigsByGroup, getConfigsByGroupName,
  getAllGroups, getConfigByKey, addConfig, updateConfig,
  updateConfigValue, batchUpdateConfigValues, deleteConfig, refreshCache,
};
