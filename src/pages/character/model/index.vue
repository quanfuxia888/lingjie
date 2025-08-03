<template>
    <view class="role">
  
      <view class="role-list">
        <view class="role-list-item" v-for="character in characters" :key="character.id" @click="select(character.id,character)">
          <avatar :src="character.image" width="94" height="94"/>
          <view class="role-list-item-body">
            <view class="role-list-item-body-title">
              {{ character.name }}
              <view class="role-list-item-body-title-vip" v-if="character.is_vip===1">
                <image :src="staticImages.vip" mode="aspectFit"/>
              </view>
            </view>
          </view>
          <view v-if="charactercode == character.id" style="display: flex;align-items: center;">
            <Checked color="#4146B2"/>
          </view>
          
        </view>
        
      </view>
      
      <view class="btn">
        <nut-button width="80%" color="#4046BC" @click="beBorn" type="primary">
            确定
        </nut-button>
      </view>
    </view>
  </template>
  
  <script setup lang="ts">
  import {Checked} from '@nutui/icons-vue-taro';
  import characterService from "../../../api/modules/character";
  import {ref} from "vue";
  import {Character} from "../../../api/types/character";
  import {BASE_CONFIG} from "../../../api/config";
  import Taro from "@tarojs/taro";
  import Avatar from "../../components/avatar.vue";
  

  const character = ref({})
  const charactercode = ref<number>(0);
  const characters = ref<Character[]>([])
  const staticImages = ref({
    role: BASE_CONFIG.IMAGE_DOMAIN + '/weixin/role/role.png',
    set: BASE_CONFIG.IMAGE_DOMAIN + '/weixin/role/set.png',
    title: BASE_CONFIG.IMAGE_DOMAIN + '/weixin/role/title.png',
    vip: BASE_CONFIG.IMAGE_DOMAIN + '/weixin/role/vip.png',
  })
  
  const beBorn = () => {
    if(charactercode.value == 0){
      Taro.showToast({ title: "请选择模型", icon: "none" });
      return
    }
    const pages = Taro.getCurrentPages();  
    const prevPage = pages[pages.length - 2]; // 获取上一页面实例  
    prevPage.setData({ modeid: character.value.id,modename: character.value.name});       // 直接更新数据  
    Taro.navigateBack({ delta: 1 });
  }

  const select = (id,item) => {
    if(charactercode.value == id){
      charactercode.value = 0
      character.value = {}
    }else {
      charactercode.value = id
      console.log(item);
      
      character.value = item
    }
  }

  characterService.getGroupList().then(res => {
    characters.value = res;
  })
  
  Taro.useDidShow(() => {
    // getDevices()
  })
  
  </script>
  
  <style lang="scss">
  .role {
    min-height: 100vh;
    background: linear-gradient(180deg, #DFE4F2 0%, #FFFFFF 100%);
  }
  
  .btn{
    display: flex;
    justify-content: center;
    position: fixed;
    bottom: 80rpx;
    width: 100%;
  }

  .role-header {
    display: flex;
    justify-content: space-between;
    padding-right: 30rpx;
  
    &-logo {
      width: 357rpx;
      height: 500rpx;
  
      image {
        width: 100%;
      }
    }
  
    &-body {
      display: flex;
      flex-direction: column;
  
      &-title {
        margin-top: 78rpx;
        width: 288rpx;
        height: 94rpx;
  
        image {
          width: 288rpx;
          height: 94rpx;
        }
      }
  
      &-add {
        margin-top: 26rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 500;
        font-size: 30rpx;
        color: #FFFFFF;
      }
  
      &-my {
        margin-top: 26rpx;
        display: flex;
        justify-content: flex-end;
        padding-right: 28rpx;
        height: 40rpx;
        font-weight: 500;
        font-size: 30rpx;
        color: #4046BC;
        line-height: 35rpx;
      }
    }
  
  }
  
  .role-list {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-bottom: 200rpx;
  
    &-item {
      margin-top: 20rpx;
      display: flex;
      justify-content: flex-start;
      width: 674rpx;
      padding: 12rpx 16rpx;
      background: #ffffff;
      box-shadow: 0rpx 2rpx 4rpx 0rpx #DDD1FC;
      border-radius: 40rpx 40rpx 40rpx 40rpx;
  
      &-avatar {
        width: 154rpx;
        height: 154rpx;
  
        image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
  
      &-body {
        display: flex;
        flex-direction: column;
        margin-left: 20rpx;
        width: 424rpx;
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
  
          &-vip {
            display: flex;
            width: 98rpx;
            height: 36rpx;
            justify-content: center;
            align-items: center;
            position: absolute;
            right: -120rpx;
            top: 0;
  
            image {
              width: 98rpx;
              height: 36rpx;
            }
          }
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
  
          &-set {
            position: absolute;
            right: -90rpx;
            top: -30rpx;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100rpx;
            height: 100rpx;
  
            image {
              width: 30rpx;
              height: 30rpx;
            }
          }
        }
      }
  
  
    }
  }
  </style>