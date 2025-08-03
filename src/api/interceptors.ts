// api/interceptors.ts
// 请求拦截器
import Taro from "@tarojs/taro";

export const requestInterceptor = (config) => {
  // 添加 Token
  const token = Taro.getStorageSync('token');
  if (token) {
    config.header.Authorization = `Bearer ${token}`;
  }
  return config;
};

// 响应拦截器
export const responseInterceptor = <T>(response: Taro.request.SuccessCallbackResult) => {
  if (response.statusCode !== 200) {
    Taro.showToast({ title: `请求错误: ${response.statusCode}`, icon: 'none' });
    throw new Error('API Response Error');
  }

  const data = response.data as T;
  // 根据业务状态码处理
  // if (data.code !== 0) {
  //   handleBusinessError(data.code);
  // }
  return data;
};