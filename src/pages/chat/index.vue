<template>
  <view class="chat">
    <!--    <view class="chat-loading" v-if="showLoading">
          <Loading/>
        </view>-->

    <view class="chat-device" @click="showSelect=true">
      <view class="chat-device-avatar">
        
          <image style="width: 100%;height: 100%;border-radius: 50%;" :src="currentDeviceCharacter.avatar"/>
        
      </view>
      <view class="chat-device-info">
        <view class="chat-device-info-name">{{ currentDeviceCharacter.deviceName }}</view>
        <view class="chat-device-info-character">{{ currentDeviceCharacter.characterName }}</view>
        <view class="chat-device-info-icon">
          <RectDown/>
        </view>
      </view>
    </view>

    <!-- <view class="chat-list">
      <view class="chat-list-item" v-for="dialogueInfo in 10" :key="dialogueInfo">
        <view class="chat-list-item-character">
          <view class="chat-list-item-character-text">
            1111111111111111111111111111111111111111111111111111111
          </view>
        </view>
        <view class="chat-list-item-user">
          <view class="chat-list-item-user-text">
           111111111111111111111111111111111111111111111111111111
          </view>
        </view>
      </view>
    </view> -->


    <view class="chat-list" v-if="dialogueInfoList.length > 0">
      <view class="chat-list-item" v-for="dialogueInfo in dialogueInfoList" :key="dialogueInfo.id">
        <view class="chat-list-item-character" v-if="dialogueInfo.speaker == 'assistant'">
          <view class="chat-list-item-character-text">
            {{ dialogueInfo.content }}
          </view>
        </view>
        <view class="chat-list-item-user" v-else>
          <view class="chat-list-item-user-text">
            {{ dialogueInfo.content }}
          </view>
        </view>
      </view>
    </view>
    <view class="chat-no" v-else>
      <image :src="noChatImage" mode="aspectFill"/>
      <view class="chat-no-text">
        等你来聊哦~
      </view>
    </view>

    <nut-popup v-model:visible="showSelect" position="bottom">
      <nut-picker v-model="selectValue" :columns="deviceInfoList" title="请选择设备与人设"
                  @confirm="confirmCharacter" @cancel="showSelect = false"/>
    </nut-popup>

  </view>
</template>

<script setup lang="ts">
import {getUserInfo} from "../../api/modules/auth";
import {ref} from "vue";
import characterService from "../../api/modules/character";
import {Loading, RectDown} from '@nutui/icons-vue-taro';
import type {DialogueInfo} from "../../api/types/character";
import Taro from "@tarojs/taro";
import deviceService from "../../api/modules/device";
import type {DeviceInfo} from "../../api/types/device";
import {BASE_CONFIG} from "../../api/config";

const userInfo = getUserInfo()

const searchParams = ref({sn: '', character_id: 0, page: 1})

const dialogueInfoList = ref<DialogueInfo[]>([])

const showLoading = ref(false);

const currentDeviceCharacter = ref({deviceName: '', sn: '', characterName: '', characterId: 0, avatar: ''})

const showSelect = ref(false);
const selectValue = ref(['', ''])
const deviceInfoList = ref([[], []])

const noChatImage = ref(BASE_CONFIG.IMAGE_DOMAIN + "/weixin/chat/robot.png")

const loadDialogue = () => {
  if (searchParams.value.sn === '' || searchParams.value.character_id === 0) {
    return;
  }
  characterService.dialogue(searchParams.value.sn, searchParams.value.character_id, searchParams.value.page).then((res) => {
    showLoading.value = false;
    if (res.data.length > 0) {
      searchParams.value.page = res.current_page + 1
      for (let i = 0; i < res.data.length; i++) {
        dialogueInfoList.value.unshift(res.data[i]);
      }
    }
  })
}

const usedCharacter = {}

const usedCharacters = () => {
  deviceInfoList.value[1] = []
  characterService.getUserCharacters().then((res) => {
    console.log("使用过的人设", res)
    if (res.length > 0) {
      for (let i = 0; i < res.length; i++) {
        if (i == 0 && currentDeviceCharacter.value.characterName == '') {
          selectValue.value[1] = res[i].id + ""
          currentDeviceCharacter.value.characterName = res[i].name
          currentDeviceCharacter.value.characterId = res[i].id
          currentDeviceCharacter.value.avatar = res[i].avatar
          if (searchParams.value.character_id == 0) {
            searchParams.value.character_id = res[i].id
            loadDialogue()
          }
        }
        usedCharacter[res[i].id] = res[i].avatar
        deviceInfoList.value[1].push({
          value: res[i].id + "",
          text: res[i].name,
        });
      }

    }
  })
}

Taro.usePullDownRefresh(() => {
  showLoading.value = true;
  loadDialogue()
})

const findCharacterAvatar = () => {

}

const getDevices = () => {
  deviceInfoList.value[0] = []
  deviceService.getDevices().then(deviceList => {
    if (deviceList.length > 0) {
      for (let i = 0; i < deviceList.length; i++) {
        let name: string = ''
        switch (deviceList[i].product_type) {
          case 1:
            name = "AI挂件" + deviceList[i].sn.slice(-5);
            break;
          case 2:
            name = "AI故事机" + deviceList[i].sn.slice(-5);
            break;
          case 3:
            name = "AI家庭玩具" + deviceList[i].sn.slice(-5);
            break;
          case 4:
            name = "AI儿童相机" + deviceList[i].sn.slice(-5);
            break;
        }
        if (i == 0 && currentDeviceCharacter.value.deviceName == '') {
          currentDeviceCharacter.value.deviceName = name
          currentDeviceCharacter.value.sn = deviceList[i].sn;
          if (searchParams.value.sn == '') {
            searchParams.value.sn = deviceList[i].sn
            loadDialogue()
          }
        }

        let deviceInfo: DeviceInfo = {
          value: deviceList[i].sn,
          text: name,
        }
        deviceInfoList.value[0].push(deviceInfo);
      }
    }
  })
}

const clearDialogue = () => {
  dialogueInfoList.value = []
}

const confirmCharacter = (obj) => {
  showSelect.value = false
  console.log(obj)
  if (obj.selectedValue[0] == '') {
    obj.selectedValue[0] = searchParams.value.sn
  }
  if (obj.selectedValue[1] == '') {
    obj.selectedValue[1] = searchParams.value.character_id
  }
  selectValue.value = obj.selectedValue;
  if (obj.selectedValue[0] != searchParams.value.sn || obj.selectedValue[1] != searchParams.value.character_id) {
    searchParams.value.sn = selectValue.value[0]
    searchParams.value.character_id = selectValue.value[1]
    searchParams.value.page = 1
    currentDeviceCharacter.value.deviceName = obj.selectedOptions[0].text
    currentDeviceCharacter.value.characterName = obj.selectedOptions[1].text
    currentDeviceCharacter.value.characterId = obj.selectedOptions[1].value
    currentDeviceCharacter.value.sn = obj.selectedOptions[0].value
    currentDeviceCharacter.value.avatar = usedCharacter[selectValue.value[1]]
    clearDialogue()
    loadDialogue()
  }

}

Taro.useDidShow(() => {
  deviceInfoList.value[0] = []
  deviceInfoList.value[1] = []
  getDevices()
  usedCharacters()
})

</script>

<style lang="scss">
.chat {
  background: linear-gradient(180deg, #DFE4F2 0%, #FFFFFF 100%);
  
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
  

  &-loading {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &-no {
    display: flex;
    justify-content: center;
    flex-grow: 1;
    align-items: center;
    margin-top: -160rpx;
    flex-direction: column;

    &-text {
      height: 40rpx;
      font-weight: 500;
      font-size: 40rpx;
      color: #A6A7AA;
      line-height: 40rpx;
      text-align: left;
      margin-top: 28rpx;
    }
  }

  &-device {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 40rpx;
    z-index: 99;
    height: 80rpx;
    width: 100%;

    &-avatar {
      width: 75rpx;
      height: 75rpx;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &-info {
      height: 60rpx;
      padding: 0 20rpx;
      background: #FFFFFF;
      border-radius: 60rpx 60rpx 60rpx 60rpx;
      display: flex;
      margin-left: 10rpx;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 24rpx;
      color: #664809;
      line-height: 28rpx;
      text-align: left;
      font-style: normal;
      text-transform: none;

      &-character {
        margin-left: 20rpx;
      }
    }


  }

  &-list {
    display: flex;
    flex-direction: column;
    margin-top: 140rpx;
    padding: 0 50rpx 200rpx 50rpx;

    &-item {
      margin-top: 40rpx;

      &-character {

        display: flex;
        justify-content: flex-start;
        flex-grow: 1;

        &-text {
          max-width: 522rpx;
          padding: 20rpx;
          background: #DDD1FC;
          box-shadow: 0rpx 2rpx 4rpx 0rpx rgba(0, 0, 0, 0.5);
          border-radius: 0 60rpx 60rpx;
          font-weight: 400;
          font-size: 28rpx;
          color: #323234;
          line-height: 33rpx;
          text-align: left;
          overflow-wrap: break-word;  /* 允许长单词或URL内部换行 */
          word-wrap: break-word;
        }

      }

      &-user {
        margin-top: 40rpx;
        display: flex;
        justify-content: flex-end;
        flex-grow: 1;

        &-text {
          padding: 20rpx;
          background: #FFFFFF;
          box-shadow: 0rpx 2rpx 4rpx 0rpx rgba(0, 0, 0, 0.5);
          border-radius: 60rpx 0rpx 60rpx 60rpx;
          max-width: 522rpx;
          font-weight: 400;
          font-size: 28rpx;
          color: #323234;
          line-height: 33rpx;
          text-align: left;
          overflow-wrap: break-word;  /* 允许长单词或URL内部换行 */
          word-wrap: break-word;
        }
      }
    }
  }
}
</style>