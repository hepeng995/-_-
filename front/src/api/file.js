import axios from 'axios'

// 文件上传相关API
export default {
  /**
   * 上传文件
   */
  uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    // 获取token
    const token = sessionStorage.getItem('token')
    
    return axios({
      url: '/api/file/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
  },

  /**
   * 批量上传文件
   */
  uploadFiles(files) {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })
    
    return request({
      url: '/file/upload/batch',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 删除文件
   */
  deleteFile(filename) {
    return request({
      url: `/file/delete/${filename}`,
      method: 'delete'
    })
  }
}
