<template>
  <view class="ray-avatar" :style="{ width: `${props.width}rpx`,height: `${props.height}rpx` }">
    <image :src="props.src"/>
  </view>
</template>
<script setup lang="ts">
interface Props {
  src: string;
  width: number;
  height: number;
}


const props = withDefaults(defineProps<Props>(), {})

</script>

<style lang="scss">
.ray-avatar {
  border-radius: 50%;
  overflow: hidden; // 关键属性
  position: relative;
  image {
    width: 100%;
    height: 100%;
    // border-radius: 50% !important;
  }
}
</style>