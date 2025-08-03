import Taro from "@tarojs/taro";

export declare interface WeixinPayment {
  timeStamp: any;
  nonceStr: string;
  package: string;
  signType: Taro.requestPayment.signType;
  paySign: string;
}

export interface OrderInfo {
  name:string;
  price: number;
  createTime: string;
  status: string;
}

//timeStamp: wechatInfo.value.timeStamp,
//     nonceStr: wechatInfo.value.nonceStr,
//     package: wechatInfo.value.package,
//     signType: wechatInfo.value.signType,
//     paySign: wechatInfo.value.paySign,