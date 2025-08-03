<template>
    <view class="wifi">
        <view v-if="setup === 'one'">
            <view class="wifi-top">仅支持2.4GHz频段Wi-Fi</view>
        <view style="margin-top: 60rpx;">
            <input class="custom-input" v-model="wifiname" placeholder="手机Wi-Fi名" />
        </view>
        <view style="margin-top: 80rpx;">
            <input class="custom-input" v-model="wifipass" placeholder="Wi-Fi密码（无密码则不用输入）" />
        </view>
        <view style="display: flex;align-items: center;margin-top: 50rpx;">
            <view @click="isSaveWifiPass = !isSaveWifiPass" style="display: flex;align-items: center;">
                 <image
                v-if="!isSaveWifiPass"
                class="wifi-icon"
                src="../../../images/public/notselected.png"
                mode="scaleToFill"
            />
            <image
                v-else
                class="wifi-icon"
                src="../../../images/public/selected.png"
                mode="scaleToFill"
            />
            </view>
            <text style="margin-left: 20rpx; font-size: 36rpx;color: #737373;">保存Wi-Fi密码</text>
        </view>
        <view style="display: flex;align-items: center;margin-top: 30rpx;">
            <image
                style="width: 40rpx;height: 40rpx;"
                src="../../../images/public/Slice32.png"
                mode="scaleToFill"
            />
            <text style="margin-left: 20rpx; font-size: 36rpx;color: #000000;">不支持连接5G Wi-Fi</text>
        </view>
        <view style="display: flex;align-items: center;justify-content: center; margin-top: 50rpx;">
            <view @click="next" style="width: 300rpx;height:80rpx;line-height: 80rpx;text-align: center;font-size: 36rpx;color: #FFFFFF;border-radius: 50rpx;background: #4046BC;">下一步</view>
        </view>
        </view>
        <view v-else>
            <view style="display: flex;justify-content: center;margin-top: 100rpx;">
                <image
                class="wifi-big"
                    src="../../../images/public/wifi.png"
                    mode="scaleToFill"
                />
            </view>
            <view style="display: flex;align-items: center;margin-top: 80rpx;justify-content: center;">
                <image
                    style="width: 40rpx;height: 40rpx;"
                    src="../../../images/public/Slice32.png"
                    mode="scaleToFill"
                />
                <text style="margin-left: 20rpx; font-size: 36rpx;color: #737373;">联网过程中不要关闭蓝牙</text>
            </view>
            <view v-if="yanzheng == 1" style="margin-top: 50rpx;display: flex;align-items: center;justify-content: center;">
                <view style="background-color: #ffffff;padding: 40rpx 120rpx;border-radius: 25rpx;">
                    <view style="display: flex;align-items: center;justify-content: center;">
                        <image
                            style="width: 70rpx;height: 70rpx;"
                            src="../../../images/public/Slice31.png"
                            mode="scaleToFill"
                        />
                    </view>
                    <view style="display: flex;align-items: center;justify-content: center;margin-top: 40rpx;">
                        配网成功
                    </view>
                </view>
                
            </view>
            <view v-if="yanzheng == 2" style="margin-top: 50rpx;display: flex;align-items: center;justify-content: center;">
                <view style="background-color: #ffffff;padding: 40rpx 120rpx;border-radius: 25rpx;">
                    <view style="display: flex;align-items: center;justify-content: center;">
                        <image
                            style="width: 70rpx;height: 70rpx;"
                            src="../../../images/public/Slice30.png"
                            mode="scaleToFill"
                        />
                    </view>
                    <view style="display: flex;align-items: center;justify-content: center;margin-top: 40rpx;">
                        验证错误
                    </view>
                </view>
                
            </view>
            <view class="wifi-bottom" style="margin-top: 40rpx;">
                <nut-steps :current="currentcode">
                    <nut-step title="手机发送账号密码"></nut-step>
                    <nut-step title="设备验证WiFi账号密码"></nut-step>
                    <nut-step title="设备连接网络..."></nut-step>
                </nut-steps>
            </view>
        </view>
    </view>
</template>


<script setup lang="ts">
import Taro from "@tarojs/taro";
import { ref,onMounted  } from 'vue'
import { Steps, Step } from '@nutui/nutui-taro'
import * as TextEncoding from 'text-encoding-shim';
const wifiname = ref('')
const wifipass = ref('')
const isSaveWifiPass = ref(false)
const setup = ref('one')
const currentcode = ref(0)
const yanzheng = ref(0)


const instance = Taro.getCurrentInstance();
const routeParams = instance?.router?.params || {};
const deviceInfo = routeParams
console.log(deviceInfo,'deviceInfo');

// 初始化蓝牙
Taro.openBluetoothAdapter({
  fail: function (res) {
    if (res.errCode === 10001) {
    }
  },
  success: function (res) {
  }
}).catch(function (err) {

})

Taro.onBluetoothAdapterStateChange((res) => {
})

// 假设这些值已经在其他地方获取并设置好了
const deviceId = ref('')
const serviceId = ref('')
const characteristicId = ref('')
deviceId.value = deviceInfo.deviceInfo
Taro.createBLEConnection({
  deviceId: deviceId.value,
  success: function (res) {
    console.log('连接蓝牙设备成功', res);
    Taro.getBLEDeviceServices({
        deviceId: deviceId.value,
        success: function (res) {
            console.log('device services:', res.services);
            // 遍历服务列表，找到需要的服务
            serviceId.value = res.services[0].uuid
            Taro.getBLEDeviceCharacteristics({
                deviceId: deviceId.value,
                serviceId: serviceId.value,
                success: function (res) {
                    console.log('device characteristics:', res.characteristics);
                    characteristicId.value = res.characteristics[0].uuid
                // 找到需要的特征值
            },
            fail: function (res) {
                console.log('getBLEDeviceCharacteristics fail', res);
            }
        });
        },
        fail: function (res) {
            console.log('getBLEDeviceServices fail', res);
        }
    });
  },
  fail: function (res) {
    console.log('连接蓝牙设备失败', res);
  }
});



// 计算校验和
function calculateChecksum(buffer: ArrayBuffer): number {
  const dataView = new DataView(buffer);
  let checksum = 0;
  for (let i = 0; i < dataView.byteLength; i++) {
    checksum ^= dataView.getUint8(i);
  }
  return checksum;
}

// 字符串转 ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoding.TextEncoder();
    return encoder.encode(str).buffer;
}

onMounted(() => {
  // 从本地存储获取保存的 Wi-Fi 密码
  const savedPass = Taro.getStorageSync('savedWifiPass')
  if (savedPass) {
    wifipass.value = savedPass
    isSaveWifiPass.value = true
  }
})


const next = async () => {
    try {
         // 使用自定义函数将 WiFi 名称和密码转换为 ArrayBuffer
        console.log(wifiname.value, wifipass.value);
        const wifiNameBuffer = stringToArrayBuffer(wifiname.value);
        const wifiPassBuffer = stringToArrayBuffer(wifipass.value);;

        const wifiNameBytes = new Uint8Array(wifiNameBuffer);
        const wifiPassBytes = new Uint8Array(wifiPassBuffer);
        const wifiNameLength = new Uint8Array([wifiNameBytes.length]);
        // WiFi 密码长度
        const wifiPassLength = new Uint8Array([wifiPassBytes.length]);
        // 2字节 1字节 wifi名 1密码 wifiname数据 wifi密码数据

        // 协议头
        // const protocolHeader = new Uint8Array([0xAA, 0x55,wifiLen,wifipasswordLen]);

        const protocolHeader = new Uint8Array([0xAA55]);
        // 合并协议头、数据长度和数据内容
        const dataBuffer = new Uint8Array([
          ...protocolHeader,
          ...wifiNameLength,
          ...wifiPassLength,
          ...wifiNameBytes,
          ...wifiPassBytes
        ]);


        // 计算校验和
        const checksum = calculateChecksum(dataBuffer.buffer);
        const checksumByte = new Uint8Array([checksum]);

        // 合并校验和
        const finalBuffer = new Uint8Array([...dataBuffer, ...checksumByte]);
        console.log(finalBuffer,'finalBuffer');
        // 通过蓝牙发送 WiFi 信息
        const res = await Taro.writeBLECharacteristicValue({
            deviceId: deviceId.value,
            serviceId: serviceId.value,
            characteristicId: characteristicId.value,
            value: finalBuffer.buffer
        });

        if (res.errMsg === 'writeBLECharacteristicValue:ok') {
            setup.value = 'two'; // 发送成功后切换到下一步界面
            if (isSaveWifiPass.value) {
                Taro.setStorageSync('savedWifiPass', wifipass.value);
            } else {
                Taro.removeStorageSync('savedWifiPass');
            }
            // 开启特征值变化监听
            Taro.onBLECharacteristicValueChange((res) => {
                const data = new Uint8Array(res.value);
                console.log('接收到蓝牙设备返回的数据:', data);
                // 假设返回的数据是 new Uint8Array([0xAA4501])
                if (data[0] === 0xAA && data[1] === 0x45 && data[2] === 0x01) {
                    console.log('收到预期的返回数据');
                    currentcode.value = 1;
                    // 可以在这里添加处理逻辑，比如提示用户配网成功等
                } else if (data[0] === 0xAA && data[1] === 0x45 && data[2] === 0x02) {
                    console.log('收到预期的返回数据');
                    currentcode.value = 2;
                    // 可以在这里添加处理逻辑，比如提示用户配网成功等
                } else if (data[0] === 0xAA && data[1] === 0x45 && data[2] === 0x03) {
                    console.log('收到预期的返回数据');
                    currentcode.value = 3;
                    yanzheng.value = 1;
                    // 可以在这里添加处理逻辑，比如提示用户配网成功等
                } else if (data[0] === 0xAA && data[1] === 0x45 && data[2] === 0x04) {
                    console.log('收到预期的返回数据');
                    currentcode.value = 0;
                    yanzheng.value = 2;
                    // 可以在这里添加处理逻辑，比如提示用户配网成功等
                } else if (data[0] === 0xAA && data[1] === 0x45 && data[2] === 0x05) {
                    console.log('收到预期的返回数据');
                    currentcode.value = 0;
                    yanzheng.value = 2;
                    // 可以在这里添加处理逻辑，比如提示用户配网成功等
                }
            });

            // 启用特征值变化通知
            await Taro.notifyBLECharacteristicValueChange({
                deviceId: deviceId.value,
                serviceId: serviceId.value,
                characteristicId: characteristicId.value,
                state: true
            });

            // 读取特征值
            await Taro.readBLECharacteristicValue({
                deviceId: deviceId.value,
                serviceId: serviceId.value,
                characteristicId: characteristicId.value
            });
        } else {
            Taro.showToast({
                title: '发送失败',
                icon: 'none'
            });
        }
    } catch (err) {
        Taro.showToast({
            title: '发送出错',
            icon: 'none'
        });
        console.error(err);
    }
}
</script>

<style lang="scss">
    .wifi{
        padding: 40rpx;
    }
    .wifi-top{
        padding-top: 20rpx;
        font-size: 36rpx;
        color: #4046BC;
        margin-bottom: 40rpx;
    }
    .custom-input {
        background: none !important;
        border: none !important;
        border-bottom: 1px solid #666666 !important;
        border-radius: 0 !important;
        padding: 20rpx;
    }
    .wifi-icon{
        width: 50rpx;
        height: 50rpx;
    }
    .wifi-big{
        width: 300rpx;
        height: 240rpx;
    }

</style>