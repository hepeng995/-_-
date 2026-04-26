/**
 * 农产品溯源 API 层
 * @description 对接后端真实接口
 */
import request from './request'

export default {
  /** 通过批次号查询溯源记录 */
  async getTraceByBatchNo(batchNo) {
    return request.get(`/trace/batch/${batchNo}`)
  },

  /** 通过商品ID查询溯源记录 */
  async getTraceByProductId(productId) {
    return request.get(`/trace/product/${productId}`)
  },

  /** 检查商品是否有溯源数据 */
  async hasTraceData(productId) {
    return request.get(`/trace/exists/${productId}`)
  }
}
