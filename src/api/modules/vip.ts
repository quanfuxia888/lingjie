import {request} from "../../utils/request";
import {WeixinPayment, OrderInfo} from '../types/vip'

class VipService {

  async pay(data): Promise<WeixinPayment> {
    return request.request({
      url: '/api/wechat-pay/pay',
      data: data,
      method: 'POST',
    })
  }

  async getList() {
      return request.request({
        url: '/api/payGoods/getList',
        method: 'POST',
      })
    }

  async privacy() {
    return request.request({
      url: '/api/user/privacy'
    })
  }

  async getOrders(): Promise<Array<OrderInfo>> {
    return request.request({
      url: '/api/user/order-list'
    })
  }

  async getVoiceList() {
    return request.request({
      url: '/api/character/voiceList',
      method: 'POST'
    })
  }
  async getVip() {
    return request.request({
      url: '/api/user/getInfo',
      method: 'POST'
    })
  }
  async updateAvatar(data) {
    return request.request({
      url: '/api/user/updateAvatar',
      method: 'POST',
      data: data
    })
  }
  async updateNickname(data) {
    return request.request({
      url: '/api/user/updateNickname',
      method: 'POST',
      data: data
    })
  }
}

export default new VipService()