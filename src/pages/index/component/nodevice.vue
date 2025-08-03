<template>
  <view class="home">
    <view class="home-device">
      <view class="home-device-robot">
        <image :src="robotImage" mode="aspectFit"/>
      </view>
      <view class="home-device-tips">当前还没有绑定设备哦~</view>
    </view>
    <view class="home-add-device">
      <nut-button color="#4046BC" @click="gotoAddDevice" type="primary">
        <template #icon>
          <Uploader/>
        </template>
        添加设备
      </nut-button>
    </view>
  </view>
</template>
<script setup lang="ts">
import {Uploader} from "@nutui/icons-vue-taro";
import Taro from "@tarojs/taro";
import {ref} from "vue";
import {BASE_CONFIG} from "../../../api/config";

const robotImage = ref(BASE_CONFIG.IMAGE_DOMAIN + "/weixin/index/robot.png")

const gotoAddDevice = () => {
  Taro.navigateTo({
    url: "/pages/device/add/index"
  })
}

</script>

<style lang="scss">

.home {
  height: 100%;
  display: flex;
  flex-direction: column;

  .home-device {
    margin-top: 278rpx;

    &-robot {
      display: flex;
      justify-content: center;
      align-items: center;

      image {
        display: block;
        width: 506rpx;
        height: 506rpx;
      }
    }

    &-tips {
      height: 40rpx;
      font-weight: 500;
      font-size: 40rpx;
      color: #A6A7AA;
      line-height: 40rpx;
      text-align: center;
      font-style: normal;
      text-transform: none;
      margin-top: 28rpx;
    }
  }

  &-add-device {
    margin-top: 210rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.home-dialog {
  .nut-dialog__header {
    font-weight: bold;
    font-size: 40rpx;
    color: #020206;
    height: 65rpx;
    line-height: 47rpx;
  }

  .nut-dialog__content {
    font-weight: 400;
    font-size: 30rpx;
    color: #000000;
    line-height: 40rpx;

    view {
      height: 160rpx;
    }
  }

  .custom-footer-cancel {
    padding-top: 24rpx;
    font-weight: 500;
    font-size: 28rpx;
    color: #A6A7AA;
    line-height: 40rpx;
  }
}
</style>