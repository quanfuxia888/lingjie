<template>
  <view class="device-container">
    <view class="device-info">
      <view class="device-info-header">
        <view class="device-info-header-logo">
          <image :src="device.image"/>
        </view>
        <view class="device-info-header-body">
          <view class="device-info-header-body-title">
            <view class="device-info-header-body-title-text" @click="changeDomain">AI挂件</view>
            <view class="device-info-header-body-title-icons">
              <image :src="device.icon"/>
            </view>
          </view>
          <view class="device-info-header-body-desc">
            ID: {{ device.sn }}
          </view>
            
        </view>

      </view>
      
      <view><button class="change-audio-btn" @click="onChangeAudio">更换音频</button></view>
      <view class="device-info-container">
        <view class="device-info-container-item">
          <view class="device-info-container-item-avatar">
            <avatar :src="device.character_img" width="154" height="154"/>
          </view>

          <view class="device-info-container-item-body">
            <view class="device-info-container-item-body-title">
              {{ device.character_name }}
            </view>
            <view class="device-info-container-item-body-content">
              <nut-ellipsis direction="end" :content="device.character_desc" :rows="3"></nut-ellipsis>
            </view>
          </view>

        </view>
        <view class="device-info-container-footer">
          <view class="device-info-container-footer-button" @click="gotoTarBar('/pages/chat/index')">
            <image style="width: 36rpx;height: 36rpx;" src="../../../images/public/Slice75.png"/>
            <!-- <Message/> -->
            查看对话
          </view>
          <view class="device-info-container-footer-button" @click="gotoTarBar('/pages/role/index')">
            <image style="width: 36rpx;height: 36rpx;" src="../../../images/public/Slice76.png"/>
            <!-- <People/> -->
            设置角色
          </view>
        </view>
      </view>


      <view class="device-info-footer">

        <!-- <view class="device-info-footer-unbinding" @click="unbinding(device.sn)">

        <view class="device-info-footer-set" @click="setDevice(device.sn)">设置设备</view>
        <view class="device-info-footer-unbinding" @click="unbinding(device.sn)">

          <image style="width: 36rpx;height: 36rpx;" src="../../../images/public/Slice99.png"/>
          <Link/>
        </view> -->
        <view class="device-info-footer-unbinding" @click="goSetup(device.sn)">
          <image style="width: 36rpx;height: 36rpx;margin-left: 36rpx;margin-right: 36rpx;" src="../../../images/public/Slice77.png"/>
          <!-- <Link/> -->
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import {Device} from "../../../api/types/device";
import {ref} from "vue";
import {BASE_CONFIG} from "../../../api/config";
import Taro from "@tarojs/taro";
import {goPage} from "../../../utils/help";
import Avatar from "../../components/avatar.vue";
import {getCommonDomain, setCommonDomain} from "@/api/modules/auth";

interface Props {
  device: Device;
}


const progress = ref(20)

let initTimes = ref(0);


const deviceTypeImage = ref(BASE_CONFIG.IMAGE_DOMAIN + '/weixin/common/blue.png')
const props = withDefaults(defineProps<Props>(), {})

const device = ref<Device>()
device.value = props.device
const updateDeviceTypeImage = (device: Device) => {
  switch (device.product_type) {
    case 1:
      deviceTypeImage.value = BASE_CONFIG.IMAGE_DOMAIN + '/weixin/common/blue.png'
      break;
    case 2:
    case 3:
    case 4:
      deviceTypeImage.value = BASE_CONFIG.IMAGE_DOMAIN + '/weixin/common/wifi.png'
      break;
  }
}

updateDeviceTypeImage(device.value)

// const emit = defineEmits<{
//   (event: 'unbinding', sn: string): void
// }>();


// const unbinding = (sn: string) => {
//   emit("unbinding", sn);
// }


const goSetup = (sn: string) => {
  goPage(`/pages/setUp/index?sn=${sn}`)
}
// const setDevice = (sn: string) => {
//   Taro.navigateTo({
//     url: "/moduleA/pages/device/update/index?sn=" + sn,
//   })
// }

const changeDomain = () => {
  initTimes.value += 1;
  console.log(initTimes.value);
  let commonDomain = getCommonDomain();
  if (initTimes.value >= 7) {
    initTimes.value = 0
    if (commonDomain != "") {
      setCommonDomain("")
      Taro.showToast({
        title: '测试环境,请重启生效',
        icon: 'success',
        duration: 2000
      })
    } else {
      setCommonDomain("https://alien.cn.waixingkeji.net")
      Taro.showToast({
        title: '生产环境,请重启生效',
        icon: 'success',
        duration: 2000
      })
    }

  }
}

const gotoTarBar = (url: string) => {
  Taro.switchTab({
    url: url,
  })
}

const onChangeAudio = () => {
    Taro.navigateTo({
      url: '/pages/device/changeAudio/index'
    });
  }

</script>

<style lang="scss">

.change-audio-btn {
  width: 90%;
  margin: 32rpx auto 0 auto;
  height: 64rpx;
  background: #F2F3FF;
  color: #4046BC;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-bar-bg {
  width: 100%;
  height: 32rpx;
  background: #F2F3F7;
  border-radius: 16rpx;
  margin: 24rpx 0 0 0;
  position: relative;
}
.progress-bar {
  height: 32rpx;
  background: linear-gradient(90deg, #A6B6F6 0%, #E1D8F7 100%);
  border-radius: 16rpx;
  position: absolute;
  left: 0;
  top: 0;
}
.progress-text {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
  font-size: 22rpx;
  color: #4046BC;
  line-height: 32rpx;
  font-weight: 500;
}
.device-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20rpx;
}

.device-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 660rpx;
  background: #FFFFFF;
  box-shadow: 0rpx 2rpx 8rpx 0rpx rgba(191, 212, 229, 0.57);
  border-radius: 20rpx 20rpx 20rpx 20rpx;

  &-header {
    height: 106rpx;
    padding-top: 10rpx;
    padding-bottom: 10rpx;
    display: flex;
    padding-left: 38rpx;
    align-items: center;

    &-logo {
      width: 68rpx;
      height: 68rpx;
      margin-right: 54rpx;

      image {
        width: 68rpx;
        height: 68rpx;
      }
    }

    &-body {
      height: 100rpx;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      flex-grow: 1;

      &-title {
        display: flex;
        justify-content: space-between;

        &-text {
          width: 248rpx;
          height: 40rpx;
          font-weight: 500;
          font-size: 40rpx;
          color: #000000;
          line-height: 40rpx;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }

        &-icons {
          //margin-left: 40rpx;

          image {
            width: 40rpx;
            height: 40rpx;
          }

          padding-right: 20rpx;
        }
      }

      &-desc {
        width: 248rpx;
        height: 40rpx;
        font-weight: 500;
        font-size: 20rpx;
        color: #737373;
        line-height: 40rpx;
        text-align: left;
        font-style: normal;
        text-transform: none;
      }
    }

  }

  &-container {
    display: flex;
    flex-direction: column;
    padding: 22rpx 38rpx;
    background: #F3F4FD;

    &-item {
      display: flex;
      justify-content: flex-start;

      &-body {
        display: flex;
        flex-direction: column;
        margin-left: 20rpx;
        justify-content: center;
        align-items: flex-start;

        &-title {
          height: 36rpx;
          font-weight: 500;
          font-size: 28rpx;
          color: #323234;
          line-height: 33rpx;
          text-align: left;
          font-style: normal;
          text-transform: none;
          position: relative;
        }

        &-content {
          margin-top: 10rpx;
          font-weight: 400;
          font-size: 24rpx;
          color: #7A7B7F;
          line-height: 28rpx;
          text-align: left;
          font-style: normal;
          text-transform: none;
          position: relative;
        }
      }
    }

    &-footer {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-top: 52rpx;
      padding-bottom: 24rpx;
      padding-right: 20rpx;
      padding-left: 20rpx;

      &-button {
        font-size: 28rpx;
        color: #454647;
        width: 200rpx;
        padding: 0 20rpx;
        height: 68rpx;
        background-color: #E8EAFF;
        border-radius: 40rpx 40rpx 40rpx 40rpx;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    }
  }

  &-footer {
    height: 92rpx;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding-right: 20rpx;
  }

}
</style>