<template>
  <view>
      <view class="device-add">
        <nut-button style="height: 60rpx;" color="#4046BC" @click="gotoAddDevice" type="primary">
          <template #icon>
            <Uploader/>
          </template>
          添加设备
        </nut-button>
      </view>

  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";

import {Uploader} from "@nutui/icons-vue-taro";


const gotoAddDevice = () => {
  Taro.navigateTo({
    url: "/pages/device/add/index"
  })
}

</script>

<style lang="scss">
.device {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .device-list {
    width: 682rpx;
    margin-top: 36rpx;
  }

  padding-bottom: 180rpx;

  &-add {
    width: 682rpx;
    display: flex;
  }
}
</style>

