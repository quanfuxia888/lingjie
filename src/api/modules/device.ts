import {request} from "../../utils/request";
import {DeviceCategory, Device} from '../types/device'

class DeviceService {

  async getDeviceCategories(): Promise<Array<DeviceCategory>> {
    return request.request({
      url: '/api/device/category'
    })
  }

  async addDevice(sn: string) {
    return request.request({
      url: '/api/user/add-device',
      method: 'POST',
      data: {
        sn: sn
      }
    })
  }

  async unbinding(sn: string) {
    return request.request({
      url: '/api/user/unbinding-device',
      method: 'POST',
      data: {
        sn: sn
      }
    })
  }

  async getUpgrade(sn: string) {
    return request.request({
      url: '/api/user/versionUpgrade',
      method: 'POST',
      data: {
        sn: sn
      }
    })
  }

  async getDevices(): Promise<Array<Device>> {
    return request.request({
      url: '/api/user/devices',
      method: 'GET'
    })
  }
}

export default new DeviceService()