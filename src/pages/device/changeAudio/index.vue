<template>
    <view class="change-audio-bg">
  
  <view class="audio-list">
    <block v-for="(item, index) in audios" :key="index">
      <view class="audio-row">
        <text class="audio-label">{{item.label}}</text>
        <text class="audio-name">{{item.name}}</text>
        <view class="upload-btn" v-if="!item.name" @click="onUpload(index)">上传</view>
      </view>
      <view class="audio-divider"></view>
    </block>
  </view>
  <button class="confirm-btn" @click="onConfirm">确定</button>
</view> 

</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Taro from "@tarojs/taro";
const audios = ref([
    { label: '提示音1', name: '', filePath: '' },
      { label: '提示音2', name: 'a0244216FB37.mp3', filePath: '' },
      { label: '提示音3', name: '38479837492.mp3', filePath: '' }
])

const onUpload = (e) => {
    const idx = e;
    Taro.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3'],
      success: res => {
        const file = res.tempFiles[0];
        const name = file.name;
        const filePath = file.path;
        const audios = audios.value;

        audios[idx].name = name;
        audios[idx].filePath = filePath;
        
      }
    })
  }
  const onConfirm = () => {
    const files = audios.value.map(a => a.filePath).filter(Boolean);
    if (files.length === 0) {
      Taro.showToast({ title: '请先上传音频', icon: 'none' });
      return;
    }
    Taro.navigateBack();
  }

</script >

<style>
.change-audio-bg {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(180deg, #DFE4F2 0%, #fff 100%);
  position: relative;
  overflow: hidden;
}
.nav-bar {
  width: 100vw;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 0;
}
.back-btn {
  position: absolute;
  left: 16rpx;
  top: 60rpx;
  width: 88rpx;
  height: 88rpx;
  background: transparent;
  border: none;
  padding: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon {
  width: 40rpx;
  height: 40rpx;
  margin-top: 0;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
  line-height: 88rpx;
}
.audio-list {
  margin: 32rpx 0 0 0;
  background: transparent;
}
.audio-row {
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  height: 80rpx;
  position: relative;
}
.audio-label {
  font-size: 28rpx;
  color: #222;
  flex: 1;
}
.audio-name {
  font-size: 24rpx;
  color: #AEB3C2;
  margin-right: 24rpx;
}
.upload-btn {
  color: #4046BC;
  font-size: 26rpx;
  background: transparent;
  border: none;
  padding: 0;
  margin-right: 24rpx;
}
.audio-divider {
  height: 2rpx;
  background: #F2F3F7;
  margin: 0 32rpx;
}
.confirm-btn {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: 64rpx;
  height: 80rpx;
  background: #4046BC;
  color: #fff;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 40rpx;
  border: none;
  box-shadow: 0 2rpx 8rpx 0 rgba(64,70,188,0.10);
  text-align: center;
  line-height: 80rpx;
} 

</style>