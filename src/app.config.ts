export default defineAppConfig({
  pages: [
    'pages/device/add/index',
    'pages/device/search/index',
  ],
  permission: {
    "scope.canvas": {
      "desc": "需要canvas权限"
    },
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序位置接口的效果展示"
    },
    "scope.bluetooth": {"desc": "用于连接蓝牙设备"},
  },
  requiredPrivateInfos: [
    "getLocation"
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#DFE4F2',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  }
})
