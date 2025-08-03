// src/utils/bluetooth/writer.ts
import Taro from '@tarojs/taro'
import character from "@/api/modules/character";
import {CharacterInfo} from "@/utils/bt";

const DEFAULT_MTU = 244
const ATT_HEADER = 3
const CHUNK_SIZE = DEFAULT_MTU - ATT_HEADER

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export interface WriteLargeOptions {
    deviceId: string
    serviceId: string
    characteristicId: string
    value: ArrayBuffer
    chunkDelay?: number // ms
    onProgress?: (progress: number) => void
}

export interface StateInterface {
    msg: string,
    type: string|number,
    show: boolean,
    cover: boolean,
    title: string,
    bleConnected: boolean,
    bleDeviceId: string,
    bottom: string,
    center: boolean
}

/**
 * 分包写入大数据
 */
export async function writeLargeData({
                                         deviceId,
                                         serviceId,
                                         characteristicId,
                                         value,
                                         chunkDelay = 50,
                                         onProgress,
                                     }: WriteLargeOptions): Promise<void> {
    const total = value.byteLength
    let offset = 0

    while (offset < total) {
        const end = Math.min(offset + CHUNK_SIZE, total)
        const chunk = value.slice(offset, end)
        console.log('写入数据中', offset)
        await Taro.writeBLECharacteristicValue({
            deviceId,
            serviceId,
            characteristicId,
            value: chunk,
        })

        if (onProgress) {
            onProgress(Math.min(100, Math.round((end / total) * 100)))
        }

        await sleep(chunkDelay)
        offset = end
    }
}
// src/utils/bluetooth/utf8.ts
export function encodeUtf8(str: string): Uint8Array {
    const utf8 = unescape(encodeURIComponent(str))
    const result = new Uint8Array(utf8.length)
    for (let i = 0; i < utf8.length; i++) {
        result[i] = utf8.charCodeAt(i)
    }
    return result
}


/**
 * 将 JSON 编码为带长度前缀的 ArrayBuffer
 */
export function encodeJsonWithLength(json: object | string): ArrayBuffer {
    const jsonStr = typeof json === 'string' ? json : JSON.stringify(json)
    const jsonData = encodeUtf8(jsonStr)
    const length = jsonData.length

    const buffer = new Uint8Array(length + 2)
    buffer[0] = (length >> 8) & 0xff // 高位
    buffer[1] = length & 0xff        // 低位
    buffer.set(jsonData, 2)

    return buffer.buffer
}

/**
 * 发送 JSON 数据（带2字节长度头）
 */
export async function writeJsonWithLength(
    options: Omit<WriteLargeOptions, 'value'> & {
        json: object | string
    }
): Promise<void> {
    const buffer = encodeJsonWithLength(options.json)
    return writeLargeData({ ...options, value: buffer })
}

/**
 * 连接 BLE 设备
 */
export async function connectToDevice(deviceId: string,state:StateInterface): Promise<void> {
    await Taro.createBLEConnection({ deviceId: deviceId,success: function (res) {
            console.log("连接蓝牙成功",res)
            state.msg = "ble连接成功"
            state.bleConnected = true
            state.bleDeviceId = deviceId
        },
        fail: function (res) {
            state.msg = "ble连接失败:"+JSON.stringify(res)
        } })
    // await Taro.stopBluetoothDevicesDiscovery() // 连接成功后可停止扫描
}

export async function disconnectToDevice(deviceId: string,state:StateInterface): Promise<void> {
    await Taro.closeBLEConnection({
        deviceId:deviceId,
        success: function (res) {
            console.log(res)
            state.msg = "关闭ble连接成功"
        },
        fail: function (res) {
            state.msg = "关闭ble连接失败:"+JSON.stringify(res)
        }
    })
}

/**
 * 获取第一个支持写入的服务和特征值
 */
export async function getPrimaryWriteCharacteristic(deviceId: string): Promise<CharacterInfo> {
    const servicesRes = await Taro.getBLEDeviceServices({ deviceId })
    const service = servicesRes.services.find(s => s.isPrimary)
    if (!service) throw new Error('未找到主服务')

    const charRes = await Taro.getBLEDeviceCharacteristics({
        deviceId,
        serviceId: service.uuid,
    })

    const writeChar = charRes.characteristics.find(
        c => c.properties.write || c.properties.writeNoResponse
    )

    /*const writeChar = charRes.characteristics.find(
        c => /ae03$/i.test(c.uuid) && (c.properties.write || c.properties.writeNoResponse||c.properties.writeDefault)
    )*/

    if (!writeChar) {
        throw new Error('未找到支持写入的特征值')
    }

    return {
        serviceId: service.uuid,
        characteristicId: writeChar.uuid,
    }
}
