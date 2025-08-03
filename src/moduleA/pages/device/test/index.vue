<template>
  <view class="container">
    <!-- 响应式属性自动更新 -->
    <view>扫描状态：{{ scanManager.isScan ? '开启' : '关闭' }}</view>

    <!-- 普通属性修改不会触发更新 -->
    <view>普通属性：{{ scanManager.normalProp }}</view>

    <!-- 操作按钮 -->
    <button @tap="scanManager.toggleScan">切换扫描</button>
    <button @tap="handleChangeNormal">修改普通属性</button>
  </view>
</template>

<script setup lang="ts">
import {ScanManager} from './index'

const scanManager = new ScanManager()

// 普通属性修改演示
const handleChangeNormal = () => {
  scanManager.normalProp = '已修改-' + Date.now()
  console.log('普通属性已修改，但不会触发视图更新')
}
</script>