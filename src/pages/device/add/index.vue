<template>
  <view class="device">
    <view class="device-list"  @click="binding()">
      <view class="device-list-content">
        <view class="device-list-content-title">搜索设备</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">

import Taro from "@tarojs/taro";

const binding = () => {
    Taro.navigateTo({
    url: "/pages/device/search/index?type=2"
  })
  
}

</script>

<style lang="scss">
.device {
  padding-top: 98rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &-list {
    width: 600rpx;
    height: 190rpx;
    background: #FFFFFF;
    box-shadow: 0rpx 2rpx 20rpx 0rpx rgba(191, 212, 229, 0.57);
    border-radius: 20rpx 20rpx 20rpx 20rpx;
    display: flex;
    justify-content: center;
    padding: 22rpx 41rpx;
    margin-top: 26rpx;

    &-logo {
      width: 190rpx;
      height: 190rpx;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &-content {
      padding-left: 52rpx;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      &-title {
        height: 40rpx;
        font-weight: 500;
        font-size: 40rpx;
        color: #000000;
        line-height: 40rpx;
        text-align: left;
        font-style: normal;
        text-transform: none;
      }

      &-body {
        margin-top: 18rpx;
        height: 80rpx;
        font-weight: 500;
        font-size: 28rpx;
        color: #A6A7AA;
        line-height: 40rpx;
        text-align: left;
        font-style: normal;
        text-transform: none;
      }
    }
  }
}
</style>