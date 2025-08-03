import {BluetoothEventCallback, BluetoothOTAManager} from "../lib/bluetoothOTAManager";
import {BTAdapter, BTBean} from "../lib/bluetooth";
import {getLogger, setLogEnable} from "../lib/logger";
import {setLogger as setOTALogger, Logger, OTAConfig, ReConnectMsg, UpgradeType} from "../lib/jl_lib/jl_ota_2.1.1";
import {setLogger as setRCSPLogger} from "../lib/jl_lib/jl_rcsp_ota_2.1.1";
import {setLogger as setAppLogger} from "../lib/log";
import {ref, Ref} from "vue";
import Taro from "@tarojs/taro";

// import {BASE_CONFIG} from "../../api/config";

export class OtaService {

  private _gbIsHandshake: boolean;
  private _gbMtuNum: number;
  private _gbDevelop: boolean;
  private _bluetoothManager: BluetoothOTAManager
  private _connectedDevice: Ref<BTBean.BluetoothDevice | null> = ref<BTBean.BluetoothDevice | null>(null)
  private _logger: Logger

  public isShowProgress: Ref<boolean> = ref(false);

  protected lastUpDateTime: number = 0

  protected bluetoothEventCallback: BluetoothEventCallback

  public isScaning: Ref<boolean> = ref(false)
  public mStatus: Ref<number> = ref(0)
  public mValue: Ref<number> = ref(0)
  public mOtaResult: Ref<number> = ref(0)

  public filterDevName: string = "AIBT"

  private _scanDevices: Ref<Array<BTBean.BluetoothDevice>>

  private _callback?: (progress: number,m:number) => void

  constructor(platform: string, filterName: string,cb:(p:number,m:number)=>void) {
    this._gbIsHandshake = true;
    this._callback = cb
    this._gbMtuNum = 512;
    this._gbDevelop = true;
    this.filterDevName = filterName
    this._scanDevices = ref<Array<BTBean.BluetoothDevice>>([])
    this._initLogger()
    this._bluetoothManager = new BluetoothOTAManager(platform)
    this._initConfigure()
    this._initBluetoothEventCallback()
    this._bluetoothManager.addBluetoothEventCallback(this.bluetoothEventCallback)
  }

  get scanDevices(): BTBean.BluetoothDevice[] | any {
    return this._scanDevices.value;
  }

  private _initConfigure() {

    const cacheIsHandshake = Taro.getStorageSync("IsHandshake")
    if (cacheIsHandshake != "") {
      this._gbIsHandshake = cacheIsHandshake
    }

    const cacheMtuNum = Taro.getStorageSync("MtuNum")
    if (cacheMtuNum != "") {
      this._gbMtuNum = cacheMtuNum
    }
    const cacheServiceUUID = Taro.getStorageSync("ServiceUUID")
    const cacheNotifyCharacteristicUUID = Taro.getStorageSync("NotifyCharacteristicUUID")
    const cacheWriteCharacteristicUUID = Taro.getStorageSync("WriteCharacteristicUUID")

    const configure = this._bluetoothManager.getConfigure()
    configure.isUseAuth = this._gbIsHandshake
    configure.changeMTU = this._gbMtuNum
//todo 目前未实现自动化测试OTA
    configure.isAutoTestOTA = false;
    configure.autoTestOTACount = 20;
    if (cacheServiceUUID != "") {
      configure.serviceUUID = cacheServiceUUID
    }
    if (cacheNotifyCharacteristicUUID != "") {
      configure.notifyCharacteristicUUID = cacheNotifyCharacteristicUUID
    }
    if (cacheWriteCharacteristicUUID != "") {
      configure.writeCharacteristicUUID = cacheWriteCharacteristicUUID
    }
    this._bluetoothManager.setConfigure(configure)

  }

  public sanDevice() {
    this._logger.logv("开始搜索设备")
    this._bluetoothManager.sanDevice()
  }

  private _initBluetoothEventCallback() {
    this.bluetoothEventCallback = new BluetoothEventCallback()
    this.bluetoothEventCallback.onBluetoothAdapter = (_availableBluetooth: boolean, _btAdapterInfo ?: BTAdapter.BTAdapterInfo) => {
      this._onBluetoothAdapter(_availableBluetooth, _btAdapterInfo)
    }
    this.bluetoothEventCallback.onLocation = (_availableLocation: boolean, _locationAdapterInfo ?: BTAdapter.LocationAdapterInfo) => {
      this._onLocation(_availableLocation, _locationAdapterInfo)
    }
    this.bluetoothEventCallback.onScanStart = () => {
      this._onScanStart()
    }
    this.bluetoothEventCallback.onScanFailed = (_err: BTBean.BluetoothError) => {
      this._onScanFailed(_err)
    }
    this.bluetoothEventCallback.onScanFinish = () => {
      this._onScanFinish()
    }
    this.bluetoothEventCallback.onFoundDev = (devices: BTBean.BluetoothDevice[]) => {
      this._onFoundDevs(devices)
    }
    this.bluetoothEventCallback.onDevStatusSuccess = (device: BTBean.BluetoothDevice) => {
      this._onDevConnectSuccess(device)
    }
    this.bluetoothEventCallback.onDevStatusDisconnect = (result: BTBean.BluetoothDevice) => {
      this._onDevDisconnect(result)
    }
    this.bluetoothEventCallback.onDevStatusFailed = (result: BTBean.BluetoothDevice) => {
      this._onDevConnectFailed(result)
    }
  }

  private _onDevConnectSuccess(device: BTBean.BluetoothDevice) {
    this._connectedDevice.value = device
    this._logger.logv("连接成功:" + device.name)

  }

  private _onDevConnectFailed(result: BTBean.BluetoothDevice) {
    this._connectedDevice.value = null
    this._logger.logv("设备连接失败:" + result.name)
  }

  private _onDevDisconnect(result: BTBean.BluetoothDevice) {
    this._logger.logv("设备断掉连接" + result.name)
    this._connectedDevice.value = null

  }


  private _onFoundDevs(devices: BTBean.BluetoothDevice[]) {
    const time = new Date().getTime()
    if (time - this.lastUpDateTime < 750) {
      return
    }
    this.lastUpDateTime = time
    let devicesTemp: BTBean.BluetoothDevice[];
    devicesTemp = devices.sort(function (a, b) {
      return b.RSSI - a.RSSI
    })
    this._filterDevName(devicesTemp)
  }

  private _filterDevName(devs: BTBean.BluetoothDevice[]) {
    const tempList = new Array()
    /* const connectedDevices = this._bluetoothManager.getConnectedDevice();
     if (connectedDevices != null) {
       connectedDevices.forEach(element => {
         if (element.name && element.name.toLowerCase().includes(this.filterDevName.toLowerCase())) {
           this._logger.logv("找到设备" + element.name)
           tempList.push(element)
         }
       })
     }*/
    devs.forEach(e => {
      const devName = e.name?.toLowerCase()
      if (devName) {
        this._logger.logv("__"+devName+"__", this.filterDevName)
      }

      const isConnected = this._bluetoothManager.isConnected(e.deviceId)//connectedDevices != null && connectedDevices.deviceId === e.deviceId
      if (e.RSSI <= 0 && devName && (devName.includes(this.filterDevName.toLowerCase())
        || devName.includes("jrh_ota") || devName.includes("aibt")) && !isConnected) {
        this._logger.logv("找到设备" + e.name)
        tempList.push(e)
        this.connectDevice(e)
       /* Taro.stopBluetoothDevicesDiscovery({
          success(res) {
            console.log('停止蓝牙搜索成功', res)
          },
        })*/
      }
    })
    this._logger.logv("所有的设备列表", tempList)
    this._scanDevices.value = tempList
  }

  private _onScanStart() {
    this._logger.logv("_onScanStart");
    this.isScaning.value = true
  }

  private _onScanFailed(_err: BTBean.BluetoothError) {
    this.isScaning.value = false
    this._logger.logv("_onScanFailed");
    this._logger.loge(_err.toString())
  }


  private _onScanFinish() {
    this._logger.logv("_onScanFinish");
    this.isScaning.value = false
  }

  private _onBluetoothAdapter(_availableBluetooth: boolean, _btAdapterInfo ?: BTAdapter.BTAdapterInfo) {
    this._logger.logv("打开蓝牙适配器")
  }

  private _onLocation(_availableLocation: boolean, _locationAdapterInfo ?: BTAdapter.LocationAdapterInfo) {

  }

  private _initLogger() {
    this._logger = getLogger()
    setOTALogger(this._logger)
    setRCSPLogger(this._logger)
    setAppLogger(this._logger)
    setLogEnable(this._gbDevelop)
  }

  public connectDevice(device: BTBean.BluetoothDevice) {
    this._logger.logv("连接指定的设备")
    this._bluetoothManager.connectDevice(device)
  }

  public startUp(upgradeData: Uint8Array) {
    /*--- 开始执行OTA升级 ---*/
    const otaConfig: OTAConfig = new OTAConfig()
    otaConfig.isSupportNewRebootWay = true
    otaConfig.updateFileData = upgradeData
    this._logger.logv("upgradeData size: " + upgradeData.length);
    const connectedDevices = this._bluetoothManager.getConnectedDevice()
    if (connectedDevices != null && connectedDevices.length > 0) {
      const otaDev = connectedDevices[0]
      this._bluetoothManager.startOTA(otaDev, otaConfig, {
        onStartOTA: () => {
          this._logger.logv("开始OTA升级")
          this.isShowProgress.value = true
          this.mStatus.value = 0

        },
        onNeedReconnect: (reConnectMsg: ReConnectMsg) => {
          this.mValue.value = 0
          this.mStatus.value = 2
          this._logger.logv(reConnectMsg.toString())
        },
        onProgress: (type: UpgradeType, progress: number) => {
          if (type == UpgradeType.UPGRADE_TYPE_CHECK_FILE) {
            this.mValue.value = progress
            this.mStatus.value = 0
            this._callback?.(progress,0)
          }
          if (type == UpgradeType.UPGRADE_TYPE_FIRMWARE) {
            this.mValue.value = progress
            this.mStatus.value = 1
            this._callback?.(progress,1)
          }
        },
        onStopOTA: () => {
          this.mValue.value = 0
          this.mOtaResult.value = 0
          this.mStatus.value = 3
          this._callback?.(100,3)
        },
        onCancelOTA: () => {
          this.mValue.value = 0
          this.mOtaResult.value = 1
          this.mStatus.value = 4
          this._callback?.(0,4)
        },
        onError: (error: number, message: string) => {
          this._logger.logv("error", message, error);
          this.mValue.value = 0
          this.mOtaResult.value = 1
          this.mStatus.value = 4
          this._callback?.(0,4)
        },
      })
    } else {
      this._logger.logv("设备未连接");
    }
  }

  public upOta(fs, filePath, fileSize) {
    try {
      const fd = fs.openSync({
        filePath: filePath
      })
      const uint8 = new Uint8Array(fileSize);
      let upgradeData: Uint8Array;
      fs.read({
        fd: fd,
        arrayBuffer: uint8.buffer,
        length: fileSize,
        success: _res => {
          upgradeData = uint8
          this._logger.logv("------------读取文件成功------------")
          fs.closeSync({fd: fd})
          this.startUp(upgradeData)
        },
        fail: _res => {
          this._logger.logv("加载失败")
          fs.closeSync({fd: fd})
        }
      })
    } catch (error) {
      this._logger.logv("文件丢失")
      this._logger.logv("error", error);
    }
  }

  public updateOTA(url: string) {
    Taro.downloadFile({
      url: url, //仅为示例，并非真实的资源
      success: (res) => {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          // res.tempFilePath
          const filePath = res.tempFilePath
          this._logger.logv("下载文件成功", res)
          const fs = Taro.getFileSystemManager()
          fs.getFileInfo({
            filePath: res.tempFilePath,
            success: (r) => {
              this._logger.logv('打开文件成功', r)
              this.upOta(fs, filePath, r.size)
            },
            fail: (res) => {
              this._logger.logv('打开文件失败', res)
            }
          })
        }
      },
      fail: (res) => {
        this._logger.logv("下载文件失败", res)
      }
    })
  }

  get connectedDevice() {
    return this._connectedDevice;
  }

  get bluetoothManager() {
    return this._bluetoothManager;
  }


}