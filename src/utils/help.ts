// ArrayBuffer转16进度字符串示例
import Taro from "@tarojs/taro";

export function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

export function goBack() {
  Taro.navigateBack()
}

export function goPage(url: string) {
  Taro.navigateTo({
    url: url
  })
}