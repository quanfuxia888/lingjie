<template>

  <view class="search">
    <view @click="sBluetoothManager.updateOTA('https://gw.test.waixingkeji.net/ai-console/update.ufw')">升级</view>
    <view>
      mStatus:{{ sBluetoothManager.mStatus }} mOtaResult:{{ sBluetoothManager.mOtaResult }}
    </view>
    <view>
      <text v-if="sBluetoothManager.mStatus==0">文件校验进度 {{ sBluetoothManager.mValue }}</text>
      <text v-if="sBluetoothManager.mStatus==1"> OTA升级进度 {{ sBluetoothManager.mValue }}</text>

    </view>
  </view>
  <view class="search-item" v-if="sBluetoothManager.scanDevices.length > 0">
    <view class="scan-device">有设备了</view>
    <template v-for="item in sBluetoothManager.scanDevices">
      <nut-cell @click="sBluetoothManager.connectDevice(item)" :title="'Blueth Name' + item.name" is-link>
        <view style="display: flex;justify-content: space-between;width: 100%;">
          <view>
            <view>Blueth Name {{ item.name }}</view>
          </view>
        </view>

      </nut-cell>
      <!-- <view class="search-item-ok">SN: {{ item.sn }}</view> -->
    </template>

  </view>

</template>

<script setup lang="ts">

import Taro from "@tarojs/taro";
import {OtaService} from "../../../services/ota";


const sysinfo = Taro.getSystemInfoSync()

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

const sBluetoothManager = new OtaService(sysinfo.platform, 'AIBT')
sBluetoothManager.sanDevice();

</script>

<style lang="scss">
.nut-cell {
  background: none;
  border: 0;
  box-shadow: none;
  border-bottom: 2rpx solid #E0E0E0;
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