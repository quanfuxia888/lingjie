// src/utils/bluetooth/writer.ts
import Taro from '@tarojs/taro'
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
    onProgress?: (text:string,progress:number) => void
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
        console.log('写入数据中', end)
        await Taro.writeBLECharacteristicValue({
            deviceId,
            serviceId,
            characteristicId,
            value: chunk,
        })

        if (onProgress) {
            onProgress("写入数据中 ",Math.min(100, Math.round((end / total) * 100)))
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

    const totalLength = 2 + 1 + 3 + length + 2 // 头部 + 命令 + 长度 + 数据 + 尾部
    const buffer = new Uint8Array(totalLength)

    // 头部固定值 0xAA55
    buffer[0] = 0xAA
    buffer[1] = 0x55
    buffer[2] = 0x01

    // 长度字段（3字节）为数据区长度（不包含头尾），即 jsonData.length
    buffer[3] = (length >> 16) & 0xff // 高位
    buffer[4] = (length >> 8) & 0xff // 中位
    buffer[5] = length & 0xff        // 低位

    // 设置数据内容
    buffer.set(jsonData, 6)

    // 尾部固定值 0x55AA
    buffer[totalLength - 2] = 0x55
    buffer[totalLength - 1] = 0xAA

    return buffer.buffer
}

export async function writeAudioData({
                                         deviceId,
                                         serviceId,
                                         characteristicId,
                                         value,
                                         chunkDelay = 50,
                                         onProgress,
                                     }: WriteLargeOptions): Promise<void> {


    const dataLength = value.byteLength
    const totalLength = 3 + 3 + dataLength + 2 // 头部 + 1自己长度命令 + 3字节长度 + 数据 + 尾部

    const buffer = new Uint8Array(totalLength)

    // 头部 0xAA55
    buffer[0] = 0xAA
    buffer[1] = 0x44
    buffer[2] = 0x02

    // 3 字节数据长度（高位在前）
    buffer[3] = (dataLength >> 16) & 0xff // 高位
    buffer[4] = (dataLength >> 8) & 0xff  // 中位
    buffer[5] = dataLength & 0xff         // 低位

    // 数据区
    buffer.set(new Uint8Array(value), 6)

    // 尾部 0x55AA
    buffer[totalLength - 2] = 0x44
    buffer[totalLength - 1] = 0xAA

    await writeLargeData({deviceId, serviceId, characteristicId, value:buffer.buffer,chunkDelay,onProgress})
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

export async function enableNotifyAndListen({
                                                deviceId,
                                                serviceId,
                                                onData,
                                            }: {
    deviceId: string
    serviceId: string
    onData?: (text: string) => void
}) {
    const { characteristics } = await Taro.getBLEDeviceCharacteristics({
        deviceId,
        serviceId,
    })

    const notifyChar = characteristics.find(c =>
        (c.properties.notify || c.properties.indicate)
    )

    if (!notifyChar) throw new Error('找不到支持 notify/indicate 的特征')

    await Taro.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId,
        characteristicId: notifyChar.uuid,
        state: true,
    })

    console.log('✅ Notify 已开启，等待设备推送数据...')

    Taro.onBLECharacteristicValueChange(res => {
        const data = new Uint8Array(res.value)
        const text = decodeUtf8(data)

        console.log(`📥 收到 ${res.characteristicId} 数据:`, data, '| 转换为:', text)

        if (onData) {
            onData(text)
        }
    })
}

export async function downloadFileAsArrayBuffer(url: string): Promise<ArrayBuffer> {
    const downloadRes = await Taro.downloadFile({ url })

    if (downloadRes.statusCode !== 200 || !downloadRes.tempFilePath) {
        throw new Error('文件下载失败')
    }

    const fs = wx.getFileSystemManager()

    return new Promise<ArrayBuffer>((resolve, reject) => {
        fs.readFile({
            filePath: downloadRes.tempFilePath,
            encoding: undefined, // 注意：不要设置为 base64
            success(res) {
                console.log("读取音频数据成功",res)
                // const buffer = new Uint8Array(res.data).buffer

                resolve( res.data as ArrayBuffer)
            },
            fail(err) {
                console.log("读取音频数据失败",err)
                reject(err)
            },
        })
    })
}

function decodeUtf8(data: Uint8Array): string {
    let result = ''
    let i = 0

    while (i < data.length) {
        const byte1 = data[i++]

        if (byte1 < 0x80) {
            result += String.fromCharCode(byte1)
        } else if (byte1 >= 0xc0 && byte1 < 0xe0) {
            const byte2 = data[i++]
            result += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f))
        } else if (byte1 >= 0xe0 && byte1 < 0xf0) {
            const byte2 = data[i++]
            const byte3 = data[i++]
            result += String.fromCharCode(
                ((byte1 & 0x0f) << 12) |
                ((byte2 & 0x3f) << 6) |
                (byte3 & 0x3f)
            )
        } else {
            // 非法 UTF-8 或超出 BMP 范围（不支持 4 字节）
            result += '?'
        }
    }

    return result
}


