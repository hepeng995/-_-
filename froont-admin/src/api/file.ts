import axios from 'axios';
import type { ApiResponse, UploadResult } from '../types';

/** 上传文件（独立 axios 调用，使用 multipart/form-data） */
export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const token = sessionStorage.getItem('token');

  return axios.post<ApiResponse<UploadResult>>('/api/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
}

/** 批量上传文件 */
export function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const token = sessionStorage.getItem('token');

  return axios.post<ApiResponse<UploadResult[]>>('/api/file/upload/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
}

/** 删除文件 */
export function deleteFile(filename: string) {
  const token = sessionStorage.getItem('token');

  return axios.delete(`/api/file/delete/${filename}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
}

export default { uploadFile, uploadFiles, deleteFile };
