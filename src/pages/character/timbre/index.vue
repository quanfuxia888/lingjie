<template>
    <view class="timbre">
        <view class="timbre_tab">
            <view class="timbre_tab_item" v-for="item in list" :key="item.paneKey" @click="changeTab(item.title)">
                <view :class="{active: tabValue === item.title}">
                    <text style="padding-bottom: 10rpx;" :class="{active_b: tabValue === item.title}">
                        {{ item.title }}
                    </text>
                </view>
            </view>
        </view>
        <view class="timbre_content">
            <view class="role">
  
  <view class="role-list" v-if="tabValue === '推荐'">
    <view class="role-list-item" v-for="character in characterone" :key="character.id" @click="select(character.id,character)">
        <view class="role-list-item-vip" v-if="character.is_vip===1">
                <image :src="staticImages.vip" mode="aspectFit"/>
            </view>
        <view class="role-list-item-box">
            
            <view class="role-list-item-box-title">
                {{ character.name }}
            </view>
            <view class="role-list-item-box-content">
                {{ character.brief }}
            </view>
        </view>
      <view style="width: 10%;display: flex;align-items: center;">
        <view v-if="charactercode == character.id" style="display: flex;align-items: center;">
        <Checked color="#4146B2"/>
      </view>
      </view>
    </view>
  </view>

  <view class="role-list" v-if="tabValue === '男声'">
    <view class="role-list-item" v-for="character in charactertwo" :key="character.id" @click="select(character.id,character)">
        <view class="role-list-item-vip" v-if="character.is_vip===1">
                <image :src="staticImages.vip" mode="aspectFit"/>
            </view>
        <view class="role-list-item-box">
            
            <view class="role-list-item-box-title">
                {{ character.name }}
            </view>
            <view class="role-list-item-box-content">
                {{ character.brief }}
            </view>
        </view>
      <view style="width: 10%;display: flex;align-items: center;">
        <view v-if="charactercode == character.id" style="display: flex;align-items: center;">
        <Checked color="#4146B2"/>
      </view>
      </view>
    </view>
  </view>

  <view class="role-list" v-if="tabValue === '女声'">
    <view class="role-list-item" v-for="character in characterthree" :key="character.id" @click="select(character.id,character)">
        <view class="role-list-item-vip" v-if="character.is_vip===1">
                <image :src="staticImages.vip" mode="aspectFit"/>
            </view>
        <view class="role-list-item-box">
            
            <view class="role-list-item-box-title">
                {{ character.name }}
            </view>
            <view class="role-list-item-box-content">
                {{ character.brief }}
            </view>
        </view>
      <view style="width: 10%;display: flex;align-items: center;">
        <view v-if="charactercode == character.id" style="display: flex;align-items: center;">
        <Checked color="#4146B2"/>
      </view>
      </view>
    </view>
  </view>
  
  <view class="btn">
    <nut-button width="80%" color="#4046BC" @click="beBorn" type="primary">
        确定
    </nut-button>
  </view>

</view>
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


  const audioContext = Taro.createInnerAudioContext(); 
  const tabValue = ref('推荐')
  const list = ref([
    {
      title: '推荐',
      paneKey: 'c1'
    },
    {
      title: '男声',
      paneKey: 'c2'
    },
    {
      title: '女声',
      paneKey: 'c3'
    }
  ])
  const charactercode = ref<number>(0);
  const characterone = ref<Character[]>([])
  const charactertwo = ref<Character[]>([])
  const characterthree = ref<Character[]>([])
  const staticImages = ref({
    role: BASE_CONFIG.IMAGE_DOMAIN + '/weixin/role/role.png',
    set: BASE_CONFIG.IMAGE_DOMAIN + '/weixin/role/set.png',
    title: BASE_CONFIG.IMAGE_DOMAIN + '/weixin/role/title.png',
    vip: BASE_CONFIG.IMAGE_DOMAIN + '/weixin/role/vip.png',
  })
  
  const character = ref({})
  
  const changeTab = (item) => {
    tabValue.value = item
    charactercode.value = 0
    audioContext.stop();
  }
  
  const beBorn = () => {
    if(charactercode.value == 0){
      Taro.showToast({ title: "请选择音色", icon: "none" });
      return
    }
    const pages = Taro.getCurrentPages();  
    const prevPage = pages[pages.length - 2]; // 获取上一页面实例  
    prevPage.setData({ id: character.value.id,name: character.value.name});       // 直接更新数据  
    Taro.navigateBack({ delta: 1 });          // 返回上一页  
  }

  const select = (id,item) => {
    if(charactercode.value == id){
      charactercode.value = 0
      audioContext.stop();
      character.value = {}
    } else {
      audioContext.src = item.mp3;
      audioContext.play();  
      charactercode.value = id
      character.value = item
    }
  }



  
  characterService.getVoiceList().then(res => {
    console.log(res);
    for(var i = 0;i < res.length;i++){
      if(res[i].text == '推荐'){
        characterone.value = res[i].children;
      } else if(res[i].text == '男声'){
        charactertwo.value = res[i].children;
      } else if(res[i].text == '女声'){
        characterthree.value = res[i].children;
      }
    }
    // characters.value = res;
  })
  
  Taro.useDidShow(() => {
    // getDevices()
  })
  Taro.useDidHide(() => {
    audioContext.stop();
  })
  Taro.useUnload(() => {  
    audioContext.destroy();  
  }); 
  
  </script>
  <style lang="scss">
  .timbre_tab {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin:30rpx 50rpx;
    padding-bottom: 10rpx;
    border-bottom: 5rpx solid #E0E0E0;
  }
  .custom-title {
    background-color: rgba(0,0,0,0);
    color: black;
    cursor: pointer;
  }
  .active {
    color: #4343C3;
  }
  .active_b{
    border-bottom: 5rpx solid #4343C3;
  }
  .timbre {
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

  .role-list {
    padding-bottom: 200rpx;
    display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

    &-item {
    margin-top: 20rpx;
    width: 674rpx;
    height: 110rpx;
    padding: 12rpx 16rpx;
    background: #ffffff;
    box-shadow: 0rpx 2rpx 4rpx 0rpx #DDD1FC;
    border-radius: 40rpx 40rpx 40rpx 40rpx;
    display: flex;
    justify-content: space-between;
    position: relative;
        &-box{
            display: flex;
            
            
            &-title {
              flex-shrink: 0;
            display: flex;
            align-items: center;
            font-weight: 500;
            font-size: 28rpx;
            color: #323234;
            line-height: 33rpx;
            text-align: left;
            margin-right: 20rpx;
            font-style: normal;
            text-transform: none;
            position: relative;
        }
       
       
       
        &-content {
          
            display: flex;
            align-items: center;
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
        

        

        &-vip{
            position: absolute;
            top: 0px;
            left: 0px;
            image {
            width: 98rpx;
            height: 36rpx;
          }
        }

   
    }
    
  }
  
  </style>