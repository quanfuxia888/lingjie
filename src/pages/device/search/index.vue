<template>
  <nut-config-provider :theme-vars="themeVars">
    <view class="search">
      <view class="search-going" v-if="!state.bleConnected">
        <Loading color="#4046BC"/>
        <nut-animate type="twinkle" loop>
          <view class="search-going-desc">{{ state.msg }}</view>
        </nut-animate>
      </view>
      <view class="search-item" v-if="state.bleConnected">
        <nut-cell title="已连接蓝牙">
          <view style="display: flex;justify-content: space-between;width: 100%;">
            <view>
              <view>蓝牙名称 {{ theDevice.name }} 已连接</view>
              <view>蓝牙ID: {{ theDevice.deviceId }}</view>
            </view>
          </view>
        </nut-cell>
        <view class="send-msg">
          <view class="btn-list">
            <nut-button class="msg-btn" type="primary" @click="sendTestData">获取电量</nut-button>
            <nut-button class="msg-btn" type="primary" @click="setDeviceData">设置设备信息</nut-button>
          </view>

          <nut-button class="msg-btn" block size="large" type="primary" @click="getSceneData">获取场景信息</nut-button>
          <view class="btn-list">
            <nut-button class="msg-btn" type="primary" @click="sendAudioMp3Data(1)">发送音频1</nut-button>
            <nut-button class="msg-btn" type="primary" @click="sendAudioMp3Data(2)">发送音频2</nut-button>
          </view>
          <view class="btn-list">
            <nut-button class="msg-btn" type="info" @click="sendSceneData(1,5,1,1,1,1,2)">发送场景1</nut-button>
            <nut-button class="msg-btn" type="default" @click="sendSceneData(2,4,2,0,2,0,3)">发送场景2</nut-button>
          </view>
          <view class="btn-list">
            <nut-button class="msg-btn" type="default" @click="delScene(1)">删除场景1</nut-button>
            <nut-button class="msg-btn" type="default" @click="delScene(2)">删除场景2</nut-button>
          </view>
        </view>
        <view class="msg-data">
          <view v-if="character.characteristicId!=''">
            <view> 特征码:{{ character.characteristicId }}</view>
            <view> 服务id:{{ character.serviceId }}</view>
          </view>
          <view> 消息发送状态: {{ transferObj.transferData }}:{{ transferObj.transferProgress }}%</view>
        </view>
        <view class="msg-data">
          <view v-if="state.showEle">电量数据：{{ state.eleVal }}</view>
          <view>收到数据:{{ transferObj.recData }}</view>
        </view>
      </view>
      <view v-else>
        <view class="search-item" v-if="devices.length > 0">
          <template v-for="item in devices">
            <nut-cell @click="addDevice(item)" :title="'Blueth Name' + item.name" is-link>
              <view style="display: flex;justify-content: space-between;width: 100%;">
                <view>
                  <view>Blueth Name {{ item.name }}</view>
                </view>
                <view>
                  <image style="width: 36rpx;height: 36rpx;margin-right: 20rpx;"
                         src="../../../images/public/right.png"/>
                </view>
              </view>

            </nut-cell>
            <!-- <view class="search-item-ok">SN: {{ item.sn }}</view> -->
          </template>

        </view>
      </view>
      <nut-notify
          type="success"
          v-model:visible="showSuccess"
          msg="绑定设备成功"
      />

      <nut-dialog
          custom-class="home-dialog"
          footer-direction="vertical"
          teleport="#app"
          ok-text="允许使用"
          cancel-text="下次再说"
          title="蓝牙申请"
          text-align="left"
          content="AI陪伴虚拟人申请使用您的蓝牙，为您提供相关服务（用于传输WiFi信息）。需要开启微信定位授权和系统位置信息才能使用蓝牙配网）"
          v-model:visible="showBlueTip"
          @ok="openBlueSet"
      >
        <template #footer>
          <view class="custom-footer">
            <nut-button type="primary" color="#4046BC" @click="openBlueSet">允许使用</nut-button>
            <nut-button plain type="primary" class="custom-footer-cancel" style="border: 0" @click="closeDialog"
                        size="small" color="#A6A7AA">下次再说
            </nut-button>
          </view>
        </template>
      </nut-dialog>

    </view>
  </nut-config-provider>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import {Loading} from '@nutui/icons-vue-taro';
import {onUnmounted, ref, reactive} from "vue";
import {DeviceInfo, CharacterInfo, getRandom1To9} from "../../../utils/bt";
import {
  connectToDevice,
  getPrimaryWriteCharacteristic,
  writeJsonWithLength,
  downloadFileAsArrayBuffer, writeAudioData, enableNotifyAndListen
} from "@/utils/writer";


const devices = ref<DeviceInfo[]>([])
const character = ref<CharacterInfo>({serviceId: "", characteristicId: ""})
const deviceMap = new Map<string, DeviceInfo>()
const theDevice = ref<DeviceInfo>({name: "", deviceId: ""})
const showSuccess = ref(false);
const themeVars = ref({
  "–nut-cell-group-background": '#008000',
})

const showBlueTip = ref(false)
const isBlueOk = ref(false)

const transferObj = ref<{ transferData: string, transferProgress: number, recData: string }>({transferData: "", transferProgress: 0, recData: ""})

const state = reactive({
  msg: '新搜索中...',
  type: 'text',
  show: true,
  cover: false,
  title: '',
  bleConnected: false,
  bleDeviceId: "",
  showEle: false,
  eleVal: 0,
  bottom: '',
  center: true
})

// 初始化蓝牙
Taro.openBluetoothAdapter({
  fail: function (res) {
    console.log("打开适配器失败", res)
    if (res.errCode === 10001) {
      showBlueTip.value = true
    }
  },
  success: function (res) {
    console.log("打开适配器成功")
    isBlueOk.value = true
    startDeviceSearch()
  }
}).catch(function (err) {
  console.log("打开适配器失败12", err)
})

Taro.onBluetoothAdapterStateChange((res) => {
  isBlueOk.value = res.available
  console.log("onBluetoothAdapterStateChange", res)
  if (res.available) {
    startDeviceSearch()
  }

})

// 打开系统蓝牙设置
const openBlueSet = () => {
  showBlueTip.value = false
  Taro.openSetting({
    fail: function (res) {
      console.log(res)
      Taro.showModal({
        title: "温馨提示",
        content: "打开蓝牙失败，请到手机设置里面打开"
      })
    }
  })
}

const closeDialog = () => {
  showBlueTip.value = false
}

const startDeviceSearch = () => {
  console.log("startDeviceSearch")
// 以微信硬件平台的蓝牙智能灯为例，主服务的 UUID 是 FEE7。传入这个参数，只搜索主服务 UUID 为 FEE7 的设备
  Taro.startBluetoothDevicesDiscovery({
    fail: function (res) {
      console.log("打开蓝牙失败" + res.errMsg)
    }
  })
}


Taro.onBluetoothDeviceFound((res) => {
  res.devices.forEach((e) => {
    if (
        (e.name && e.name.toLowerCase().includes("aibt")) ||  // AIBT 小写匹配
        (e.name && e.name.toLowerCase().includes("vin")) ||  // AIBT 小写匹配
        (e.name && e.name.toLowerCase().includes("ble"))      // 新增 BLE 小写匹配
    ) {
      state.show = false
      state.msg = "搜索中...找到设备"
      const deviceInfo: DeviceInfo = {
        name: e.name || e.localName,
        deviceId: e.deviceId,
      }
      if (!deviceMap.has(e.deviceId)) {
        devices.value.push(deviceInfo)
        deviceMap.set(e.deviceId, deviceInfo)
      }
    }

  })

})


const addDevice = (deviceInfo: DeviceInfo) => {
  Taro.stopBluetoothDevicesDiscovery({
    success: function (res) {
      console.log("停止蓝牙搜索", res)
    }
  })
  showSuccess.value = true
  connectBle(deviceInfo.deviceId)
}


const receiveData = (text: string) => {
  transferObj.value.recData = text
  console.log(text)
}

const connectBle = async (deviceId: string) => {
  await connectToDevice(deviceId, state)
  console.log("state value:", state)
  if (state.bleConnected) {
    theDevice.value = deviceMap.get(deviceId)
    character.value = await getPrimaryWriteCharacteristic(deviceId)

    enableNotifyAndListen({deviceId, serviceId: character.value.serviceId, onData: receiveData})

  }
  Taro.stopBluetoothDevicesDiscovery()
}

// 发送场景 1

const onProgress = (text: string, p: number) => {
  transferObj.value.transferData = text
  transferObj.value.transferProgress = p
  console.log("写入日志：", text, p)
}

const sendAudioData = async (buffer: ArrayBuffer, audioId: number) => {
  try {
    transferObj.value.transferProgress = 0
    const deviceId = theDevice.value.deviceId
    console.log("开始发送音频数据", buffer.byteLength)
    await writeAudioData({
      deviceId: deviceId, serviceId: character.value.serviceId,
      characteristicId: character.value.characteristicId, value: buffer, chunkDelay: 50, audioId: audioId, onProgress: onProgress
    })
  } catch (e) {
    Taro.showToast({title: '发送失败' + JSON.stringify(e), icon: 'none'})
    console.error(e)
  }
}

// 删除场景
const delScene = async (id: number) => {
  try {
    const deviceId = theDevice.value.deviceId
    console.log(character.value)
    transferObj.value.transferProgress = 0
    transferObj.value.transferData = "准备发送消息......"
    await writeJsonWithLength({
      deviceId,
      serviceId: character.value.serviceId,
      characteristicId: character.value.characteristicId,
      json: {
        "cmd": 5,
        "data": {
          "id": id,
        }
      },
      onProgress: onProgress,
    })
  } catch (e) {
    Taro.showToast({title: '发送失败' + JSON.stringify(e), icon: 'none'})
    console.error(e)
  }
}

const sendAudioMp3Data = async (id: number) => {
  let url = `https://gw.test.waixingkeji.net/ai-device/audio/scen${id}.mp3`
  const buffer = await downloadFileAsArrayBuffer(url)
  // return writeLargeData({ ...options, value: buffer })
  await sendAudioData(buffer, 1)
}

// 添加场景
const sendSceneData = async (id: number, count: number, s: number, f: number, v: number, p: number, t: number) => {
  try {

    const deviceId = theDevice.value.deviceId
    console.log(character.value)
    transferObj.value.transferProgress = 0
    transferObj.value.transferData = "准备发送消息......"
    await writeJsonWithLength({
      deviceId,
      serviceId: character.value.serviceId,
      characteristicId: character.value.characteristicId,
      json: {
        "cmd": 4,
        "data": {
          "s": s,
          "t": t,
          "p": p,
          "id": id,
          "f": f,
          "v": v,
          "c": count
        }
      },
      onProgress: onProgress,
    })

  } catch (e) {
    Taro.showToast({title: '发送失败' + JSON.stringify(e), icon: 'none'})
    console.error(e)
  }
}

// 获取场景
const getSceneData = () => {
  try {
    const deviceId = theDevice.value.deviceId
    transferObj.value.transferProgress = 0
    transferObj.value.transferData = "准备发送消息......"
    writeJsonWithLength({
      deviceId,
      serviceId: character.value.serviceId,
      characteristicId: character.value.characteristicId,
      json: {
        "cmd": 3, "data": "",
      },
      onProgress: onProgress,
    })

  } catch (e) {
    Taro.showToast({title: '发送失败' + JSON.stringify(e), icon: 'none'})
    console.error(e)
  }
}

// 设置设备
const setDeviceData = async () => {
  try {
    const deviceId = theDevice.value.deviceId
    const num = getRandom1To9()
    let dM = 1
    if (num <= 4) {
      dM = 2
    }
    transferObj.value.transferProgress = 0
    transferObj.value.transferData = "准备发送消息......"
    writeJsonWithLength({
      deviceId,
      serviceId: character.value.serviceId,
      characteristicId: character.value.characteristicId,
      json: {
        "cmd": 2, "data": {
          "d": `M${num}`,
          "m": dM
        },
      },
      onProgress: onProgress,
    })

  } catch (e) {
    Taro.showToast({title: '发送失败' + JSON.stringify(e), icon: 'none'})
    console.error(e)
  }
}

// 获取电量
const sendTestData = async () => {
  try {
    const deviceId = theDevice.value.deviceId

    transferObj.value.transferProgress = 0
    transferObj.value.transferData = "准备发送消息......"
    writeJsonWithLength({
      deviceId,
      serviceId: character.value.serviceId,
      characteristicId: character.value.characteristicId,
      json: {
        "cmd": 1, "data": "",
      },
      onProgress: onProgress,
    })

  } catch (e) {
    Taro.showToast({title: '发送失败' + JSON.stringify(e), icon: 'none'})
    console.error(e)
  }
}

// 停止蓝牙搜索
onUnmounted(() => {
  if (state.bleConnected) {
    Taro.closeBLEConnection({
      deviceId: state.bleDeviceId,
      success: function (res) {
        console.log(res)
        state.msg = "关闭ble连接成功"
      },
      fail: function (res) {
        state.msg = "关闭ble连接失败:" + JSON.stringify(res)
      }
    })
  }
  Taro.stopBluetoothDevicesDiscovery()
  Taro.offBluetoothAdapterStateChange((res) => {
    console.log(res)
  })
  Taro.closeBluetoothAdapter()
})

</script>

<style lang="scss">
.nut-cell {
  background: none;
  border: 0;
  box-shadow: none;
  border-bottom: 2rpx solid #E0E0E0;
}

.msg-btn {
  margin-top: 20px;
}

.msg-data {
  margin-top: 20rpx;
  padding: 10rpx;
}

.btn-list {
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;
}

.search {
  &-going {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    &-desc {
      font-weight: 500;
      font-size: 20rpx;
      color: #4046BC;

    }
  }
}
</style>