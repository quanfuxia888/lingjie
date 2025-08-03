// utils/request.ts
import Taro from '@tarojs/taro';
import {BASE_CONFIG} from "../api/config";
import {BaseResponse, BusinessError} from '../api/types/response';
import {getToken} from "../api/modules/auth";

type RequestConfig = Taro.request.Option & {
  showErrorToast?: boolean; // 自定义配置项：是否自动显示错误提示
};

class HttpRequest {
  private baseConfig: RequestConfig;

  constructor(baseUrl?: string) {
    this.baseConfig = {
      url: baseUrl || BASE_CONFIG.baseURL,
      timeout: 15000,
      showErrorToast: true // 默认开启错误提示
    };
  }

  async request<T = any>(config: RequestConfig): Promise<T> {
    const token = getToken()
    const mergedConfig: RequestConfig = {
      ...this.baseConfig,
      ...config,
      url: `${this.baseConfig.url}${config.url}`,
      header: {
        'Content-Type': 'application/json',
        'organization': BASE_CONFIG.ORGANIZATION,
        'authorization': `Bearer ${token}`
      },
    };

    try {
      const response = await Taro.request<BaseResponse<T>>(mergedConfig);

      // 响应拦截处理
      if (response.statusCode !== 200) {
        throw this.createError(response.statusCode, '网络请求异常');
      }
      const resData = response.data;
      if (resData.code !== 0) {
        throw this.createError(resData.code, resData.msg);
      }

      return resData.data; // 返回核心数据
    } catch (error) {
      if (mergedConfig.showErrorToast) {
        Taro.showToast({title: error.msg, icon: 'none'});
      }
      throw error;
    }
  }

  private createError(code: number, msg = ''): BusinessError {
    return {code, msg};
  }
}

export const request = new HttpRequest();
export const userServerRequest = new HttpRequest(BASE_CONFIG.userServerBaseURL);