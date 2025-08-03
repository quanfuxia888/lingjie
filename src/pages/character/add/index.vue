<template>
  <view class="create-role">
    <view class="create-role-header">

      <view class="create-role-header-avatar">
        <image :src="imageUrl" v-if="imageUrl!=''" mode="aspectFill"/>
      </view>
      <Uploader @click="chooseImage"/>
    </view>

    <view class="create-role-name">
      <view class="name">名称</view>
      <nut-input v-model="formData.name" type="text" placeholder="请输入名称" />
    </view>
    <view class="create-role-miaosu">
      <view class="box">
        <view class="name">设定描述</view>
        <view class="box_al" @click="generation">
            <image style="width: 32rpx;height: 32rpx;margin-right: 10rpx;" src="../../../images/public/Slice100.png" mode="aspectFit"/>
            AI生成
        </view>
      </view>
      <nut-textarea v-model="formData.prompt" placeholder="请输入设定描述"/>
    </view>

    <!-- <nut-form style="background-color: #CEDDF8;">
      <nut-form-item label="名称" style="margin-bottom: 10rpx;">
        <nut-input v-model="formData.name" placeholder="请输入名称" type="text"/>
      </nut-form-item>
      <nut-form-item label="设定描述" label-position="top">
        <nut-textarea v-model="formData.info" placeholder="请输入设定描述" type="text"/>
      </nut-form-item>
    </nut-form> -->
    <nut-cell-group>
      <nut-cell title="音色" @click="showAudioSelect" :desc="timbrevalue.toString()" is-link></nut-cell>
      <!-- <nut-cell title="模型" @click="goModel" :desc="modelvalue.toString()" is-link></nut-cell> -->
    </nut-cell-group>

    <view class="born_box">
      <nut-button width="80%" color="#4046BC" @click="beBorn" type="primary">
        生成
      </nut-button>
    </view>

  </view>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {uploadToCOS} from "../../../utils/upload";
import {Uploader} from "@nutui/icons-vue-taro";
import Taro from "@tarojs/taro";
import characterService from "../../../api/modules/character";
import {goPage} from "../../../utils/help";
import * as TextEncoding from 'text-encoding-shim';
import {BASE_CONFIG} from "../../../api/config";
import { nextTick } from 'vue';


const imageUrl = ref('');
const formData = ref({
  name: '',
  avatar: '',
  brief: '',
  prompt: '',
  tts_role_id: 0,
  llm: 0
})


const modelid = ref<number>(2);



const beBorn = () => {
  console.log('生成');
  if(!imageUrl.value){
    Taro.showToast({ title: "请上传头像", icon: "none" });
    return
  }
  if(!formData.value.name){
    Taro.showToast({ title: "请输入名称", icon: "none" });
    return
  }
  if(!formData.value.prompt){
    Taro.showToast({ title: "请输入设定描述", icon: "none" });
    return
  }
  if(!timbreid.value){
    Taro.showToast({ title: "请选择音色", icon: "none" });
    return
  }
  if(!modelid.value){
    Taro.showToast({ title: "请选择模型", icon: "none" });
    return
  }
  if(shengcheng.value == 0){
    Taro.showToast({ title: "AI正在生成描述请稍等", icon: "none" });
    return
  }
  const data = {
    name: formData.value.name,
    avatar: imageUrl.value,
    brief: '',
    prompt: formData.value.prompt,
    tts_role_id: timbreid.value,
    llm: modelid.value
  }
  characterService.create(data).then(res => {
    Taro.showToast({ title: "生成成功", icon: "success" });
    Taro.redirectTo({
        url: '/pages/myOrder/index' // 直接拼接参数‌:ml-citation{ref="1,2" data="citationList"}
    });
  })
}

const timbrevalue = ref([])
const modelvalue = ref([])
const shengcheng = ref<number>(1);
const timbreid = ref<number>(0);



const showAudioSelect = () => {
  if(shengcheng.value == 0){
    Taro.showToast({ title: "AI正在生成描述请稍等", icon: "none" });
    return
  }
  goPage('/pages/character/timbre/index')
}

const goModel = () => {
  goPage('/pages/character/model/index')
}


const textareaRef = ref(null);
const generation =async  () => {
  if(!formData.value.prompt || formData.value.prompt.length < 5){
    Taro.showToast({ title: "描述要大于5个字", icon: "none" });
    return
  }
  let buffer = '';
  let brief = formData.value.prompt;
  // 只保留这一处清空，其他地方的清空操作都移除
  formData.value = {
    ...formData.value,
    prompt: ''
  };
  await nextTick(); // 等待 DOM 更新
  formData.value = {
    ...formData.value,
    prompt: ''
  };
  shengcheng.value = 0;
  let url = BASE_CONFIG.baseURL + '/api/user/getBrief'

  const requestTask = Taro.request({
    url: url,
    enableChunked: true,
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Taro.getStorageSync('token')}`,
     },
    method: 'GET',
    data: {
      brief: brief,
    },
    // 移除这里的清空操作
    success: (res) => {},
    fail: (e) => {}
  });

  requestTask.onChunkReceived((response) => {
    const str = new TextEncoding.TextDecoder('utf-8').decode(
      new Uint8Array(response.data)
    );

    buffer += str;
    const lines = buffer.split(/(?:\r\n|\n|\r)/g);
    buffer = lines.pop() || '';
    let fullContent = '';
    lines.slice(0, -1).forEach(line => {
      const cleaned = line.replace(/^[0-9a-fA-F]+\s+/, '');
      if (cleaned.startsWith('data: ')) {
        try {
          const data = JSON.parse(cleaned.slice(6));
          fullContent += data.choices[0].delta?.content || '';
        } catch (e) {
          console.warn('解析异常:', e);
          shengcheng.value = 1
        }
      }
    });

    formData.value.prompt += fullContent;
    const textarea = textareaRef.value?.querySelector('textarea');
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  });
}



const chooseImage = async () => {
  try {
    Taro.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: async function (res) {
        console.log(res);
        
        const tempFilePath = res.tempFilePaths[0];
        
        // 使用Taro.cropImage进行裁剪
        const cropResult = await Taro.cropImage({
          src: tempFilePath,
          cropScale: '1:1', // 裁剪比例1:1
          quality: 1, // 图片质量
          outputWidth: 252, // 输出宽度
          outputHeight: 252 // 输出高度
        });

        // 上传裁剪后的图片
        uploadToCOS({ path: cropResult.tempFilePath }).then((url) => {
          imageUrl.value = url;
          console.log('上传成功:', url);
        });
      },
    });
  } catch (err) {
    Taro.showToast({title: '上传失败', icon: 'none'});
    console.error('上传错误:', err);
  }
};
Taro.useDidShow(() => {
  const pages = Taro.getCurrentPages();  
  const currPage = pages[pages.length - 1]; // 当前页面实例
  timbrevalue.value = [currPage.data.name]
  modelvalue.value = [currPage.data.modename]
  timbreid.value = currPage.data.id
})
</script>

<style lang="scss">
.nut-cell-group__wrap{
  border-radius: 50rpx;
}

.create-role {
  min-height: 100vh;
  background: linear-gradient(180deg, #DFE4F2 0%, #FFFFFF 100%);

  padding: 0 30rpx;

  .born_box{
    margin-top: 120rpx;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &-name{
    background: #FFFFFF;
    display: flex;
    align-items: center;
    padding: 10rpx 40rpx;
    margin-bottom: 20rpx;
    margin-top: 30rpx;
    border-radius: 50rpx;
    .name{
      width: 80rpx;
    }
    .nut-input--border{
      border: none;
    }
  }
  &-miaosu{
    background: #FFFFFF;
    padding: 30rpx 40rpx;
    border-radius: 50rpx;
    .box{
      display: flex;
      align-items: center;
      justify-content: space-between;
        margin-bottom: 20rpx;
      .box_al{
        display: flex;
      align-items: center;
      justify-content: center;
        background-color: #4046BC;
        color: #ffffff;
        padding: 7rpx 40rpx;
        border-radius: 50rpx;
        font-size: 24rpx;
      }
    }
    .nut-textarea {
      padding: 0rpx;
    }
  }
  &-header {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    &-avatar {

      width: 252rpx;
      height: 252rpx;
      border-radius: 50%;
      background: #FFFFFF;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;

      image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

    }

    text {
      width: 60rpx;
      height: 60rpx;
      background: #4046BC;
      border-radius: 50%;
      margin-top: -30rpx;
      color: #fff;
    }
  }


}
</style>