export default defineAppConfig({
  pages: [
    'pages/device/add/index',
    'pages/device/search/index',
    'pages/device/wifi/index',
    'pages/device/changeAudio/index',
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
  tabBar: {
    custom: true,
    color: '#ccc',
    selectedColor: '#125ad3',
    list: [
      {
        pagePath: 'pages/device/add/index',
        text: '',
        iconPath: 'images/tabbar/index.png',
        selectedIconPath: 'images/tabbar/index_active.png',
      },

      {
        pagePath: 'pages/device/wifi/index',
        text: '',
        iconPath: 'images/tabbar/role.png',
        selectedIconPath: 'images/tabbar/role_active.png',
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#DFE4F2',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  }
})
