import Taro from "@tarojs/taro";

export const getToken = (): string => {
  try {
    const token = Taro.getStorageSync("token")
    if (token) {
      return token
    }
    return ''

  } catch (e) {
    return ''
  }
}

export const getCommonDomain = (): string => {
  const domain = Taro.getStorageSync("commonDomain")
  if (domain) {
    return domain
  }
  return ''
}

export const setCommonDomain = (domain: string): void => {
  Taro.setStorage({'key': 'commonDomain', data: domain})
}

export const setToken = (token: string) => {
  Taro.setStorage({'key': 'token', data: token})
}

export const setUserInfo = (info: string) => {
  Taro.setStorage({'key': 'userInfo', data: info})
}

export const getUserInfo = () => {
  const info = Taro.getStorageSync("userInfo");
  if (info) {
    return JSON.parse(info);
  } else {
    return null;
  }
}