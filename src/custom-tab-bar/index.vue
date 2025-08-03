<!-- custom-tab-bar/index.vue -->
<template>
  <view class="custom-tab-bar">
    <view
        v-for="(item, index) in tabBar?.list"
        :key="index"
        class="tab-item"
        :class="{ active: currentPath === '/'+item.pagePath }"
        @tap="switchTab(item.pagePath)"
    >
      <image
          class="tab-icon"
          :src="currentPath === '/'+item.pagePath ? '/'+item.selectedIconPath : '/'+item.iconPath"
      />
    </view>
  </view>
</template>
<script setup lang="ts">
import {useRouter} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import {getCurrentInstance} from '@tarojs/runtime'
import {computed} from "vue";

const router = useRouter()
const currentPath = computed(() => router.path)

const switchTab = (url: string) => {
  Taro.switchTab({url: "/" + url})
}

const {tabBar} = getCurrentInstance()?.app?.config || {}
</script>
<style lang="scss">


.custom-tab-bar {
  position: fixed;
  bottom: 40rpx;
  left: 50%; /* 关键修改点1 */
  transform: translateX(-50%); /* 关键修改点2 */

  width: 662rpx;
  height: 126rpx;
  background: #FFFFFF;
  box-shadow: 0rpx 4rpx 8rpx 0rpx #DFE4F2;
  border-radius: 60rpx 60rpx 60rpx 60rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 999;

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;

    .tab-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 6px;
    }

    .tab-text {
      font-size: 22px;
      color: #666;
    }

    &.active .tab-text {
      color: #FF4F4F;
      font-weight: bold;
    }
  }
}


</style>
