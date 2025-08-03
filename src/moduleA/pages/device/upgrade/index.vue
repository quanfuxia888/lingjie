<template>
  <view class=''>
    <view class='top'>
      <!-- 替换为Canvas进度条 -->
      <view class="progress-container">
        <canvas class="progress-bg" canvas-id="canvasProgressbg"></canvas>
        <canvas class="progress-canvas" canvas-id="canvasProgress"></canvas>
        <view class="progress-text" v-if="progress == 0">
          <view class='ota-text'>OTA</view>
          <view class='version-text'>V{{ version }}</view>
        </view>
        <view class="progress-text" v-else>
          <view class='ota-text'>{{ progress }}%</view>
        </view>
      </view>
    </view>
  </view>
  <view>
    <view class='content'>
      <view class='update-title'>更新内容</view>
      <view class='update-content' v-for="item in lines">{{ item }}</view>
    </view>
    <view class='update-tip'>
      <view>提示：</view>
      <view>
        升级过程中，请将设备靠近手机，保持蓝牙连接正常。升级过程可能需要几分钟。
      </view>
    </view>
  </view>
  <view style="display: flex;justify-content: center;align-items: center;" v-if="sBluetoothManager?.connectedDevice.value!=null">
    <view v-if="!isStart" class='upgrade-button' @click="upgrade">
      <text>升级</text>
    </view>
    <view v-else class='upgrade-buttoning'>
      <text v-if="mStatus==0">文件校验中...</text>
      <text v-if="mStatus==1">OTA升级中...</text>
      <text v-if="mStatus==2">设备回连中...</text>
      <text v-if="mStatus==3">设备升级成功,请重启</text>
      <text v-if="mStatus==4">设备升级失败</text>
    </view>
  </view>
  <view v-else style="display: flex;justify-content: center;align-items: center;">
    <view class='upgrade-buttoning' v-if="mStatus!=3">
      <text>设备连接中...</text>
    </view>
    <view v-else class='upgrade-buttoning'>
      <text>设备升级成功,请重启</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import Taro from '@tarojs/taro';
import deviceService from "@/api/modules/device";
import {OtaService} from "../../../services/ota";

const sn = ref('')
const version = ref('')
const otaUrl = ref('')
const lines = ref([])

const progress = ref(0); // 当前进度值
const mStatus = ref(0); // 状态
const {windowWidth} = Taro.getSystemInfoSync()
const rpxToPx = rpx => rpx * windowWidth / 750
const canvasSize = rpxToPx(350) // 350rpx的画布
const center = canvasSize / 2
const radius = rpxToPx(165) // 165rpx的半径

// 绘制背景圆环
const drawProgressbg = () => {
  const ctx = Taro.createCanvasContext('canvasProgressbg', this);
  ctx.setLineWidth(5);
  ctx.setStrokeStyle('#D4D4D4');
  ctx.setLineCap('round');
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI, false);
  ctx.stroke();
  ctx.draw();
};

// 绘制进度圆环
const drawCircle = (step) => {
  const ctx = Taro.createCanvasContext('canvasProgress', this);
  ctx.setLineWidth(5);
  ctx.setStrokeStyle('#0091FF');
  ctx.setLineCap('round');
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (step / 100) * circumference;
  ctx.setLineDash([circumference, circumference]);
  ctx.lineDashOffset = offset;
  ctx.beginPath();
  // 修改起始角度为 -Math.PI / 2，从上方开始
  ctx.arc(center, center, radius, -Math.PI / 2, (2 * Math.PI) - (Math.PI / 2), false);
  ctx.stroke();
  ctx.draw();
};

const isStart = ref(false)
//点击升级按钮
const upgrade = () => {
  // let step = 0;
  /*timer.value = setInterval(() => {
    step += 1; // 每次增加1%
    updateProgress(step);
    if (step >= 100) {
      clearInterval(timer.value); // 停止定时器  
    }
  }, 1000)
  */
  isStart.value = true
  sBluetoothManager.updateOTA(otaUrl.value)
  // updateProgress(step);
}

// 更新进度
const updateProgress = (value: number) => {
  progress.value = value;
  console.log(progress.value);
  drawCircle(value);
};
let sBluetoothManager: OtaService
Taro.useLoad((params) => {
  sn.value = params.sn
  deviceService.getUpgrade(params.sn).then(res => {
    version.value = res.version
    otaUrl.value = res.url
    if (res.brief) {
      lines.value = res.brief.split(/[\r\n]+/).filter(item => item.trim())
    }
  })

  drawProgressbg();
  updateProgress(0); // 当前进度值，0-100
  const sysinfo = Taro.getSystemInfoSync()
  console.log(params.sn)
  sBluetoothManager = new OtaService(sysinfo.platform,params.sn, (value, status) => {
    progress.value = parseFloat(value.toFixed(2));
    drawCircle(value);
    if (value == 100 && status == 1) {
      status = 3
    }
    mStatus.value = status
  })
  sBluetoothManager.sanDevice();
})


// let _freshing: boolean = false
// let triggered: boolean = false
// const onRefresh = function () {
//   if (_freshing) return;
//   _freshing = true
//   if (!triggered) {
//     triggered = true
//   }//保证刷新状态下，triggered为true
//   sBluetoothManager.sanDevice();
//   setTimeout(() => {
//     this.setData({
//       triggered: false,//触发onRestore，关闭刷新图标
//     })
//     this._freshing = false
//   }, 1500);
// }


</script>

<style lang="scss">
.top {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.progress-container {
  position: relative;
  width: 350rpx;
  height: 350rpx;
  margin-top: 40rpx;
  margin-bottom: 40rpx;
}

.progress-bg, .progress-canvas {
  position: absolute;
  width: 350rpx;
  height: 350rpx;
}

.progress-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.update-content {
  color: #8C8C8F;
  font-size: 30rpx;
}

.ota-text {
  display: flex;
  justify-content: center;
  font-size: 48rpx;
  font-weight: bold;
}

.version-text {
  display: flex;
  justify-content: center;
  font-size: 36rpx;
  margin-top: 10rpx;
}

.content {
  padding: 0 40rpx;
  margin-bottom: 60rpx;
}

.update-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.update-list {
  font-size: 30rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.update-tip {
  font-size: 28rpx;
  padding: 0 40rpx;
  color: #999;
}

.upgrade-button {
  margin-top: 100rpx;
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  padding: 30rpx 0;
  background-color: #4046BC;
  border-radius: 50rpx;
}

.upgrade-buttoning {
  margin-top: 100rpx;
  width: 80%;
  color: #7A7B7F;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
  background-color: #E8EAFF;
  border-radius: 50rpx;
  border: none;
}


</style>