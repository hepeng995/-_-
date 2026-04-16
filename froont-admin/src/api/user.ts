import request from './request';
import type { PageResult, PageParams, User, LoginResponse, UserStats } from '../types';

/** 用户登录 */
export function login(data: { username: string; password: string }) {
  return request.post<LoginResponse>('/auth/login', data);
}

/** 获取当前登录用户信息 */
export function getUserInfo() {
  return request.get<User>('/user/info');
}

/** 用户登出 */
export function logout() {
  return request.post<void>('/auth/logout');
}

/** 分页获取用户列表 */
export function getUserList(params: PageParams) {
  return request.get<PageResult<User>>('/user/page', { params });
}

/** 获取用户详情 */
export function getUserDetail(id: number) {
  return request.get<User>(`/user/${id}`);
}

/** 添加用户 */
export function addUser(data: Partial<User> & { password: string }) {
  return request.post<void>('/user', data);
}

/** 更新用户信息 */
export function updateUser(id: number, data: Partial<User>) {
  return request.put<void>(`/user/${id}`, data);
}

/** 删除用户 */
export function deleteUser(id: number) {
  return request.delete<void>(`/user/${id}`);
}

/** 更新用户状态（启用/禁用） */
export function updateUserStatus(id: number, enabled: boolean) {
  return request.put<void>(`/user/${id}/status`, null, { params: { enabled } });
}

/** 重置用户密码 */
export function resetUserPassword(id: number) {
  return request.put<void>(`/user/${id}/reset-password`);
}

/** 检查用户名是否已存在 */
export function checkUsername(username: string) {
  return request.get<boolean>('/user/check-username', { params: { username } });
}

/** 检查邮箱是否已存在 */
export function checkEmail(email: string) {
  return request.get<boolean>('/user/check-email', { params: { email } });
}

/** 获取用户统计信息 */
export function getUserStats() {
  return request.get<UserStats>('/user/stats');
}

/** 修改个人密码 */
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request.put<void>('/user/change-password', data);
}

/** 更新个人资料 */
export function updateProfile(data: Partial<User>) {
  return request.put<void>('/user/profile', data);
}

/** 更新用户头像 */
export function updateAvatar(data: { avatar: string }) {
  return request.put<void>('/user/avatar', data);
}

export default {
  login, getUserInfo, logout, getUserList, getUserDetail,
  addUser, updateUser, deleteUser, updateUserStatus,
  resetUserPassword, checkUsername, checkEmail,
  getUserStats, changePassword, updateProfile, updateAvatar,
};
