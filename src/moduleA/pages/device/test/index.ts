import {ref, Ref} from "vue";

export class ScanManager {
  // 响应式属性（通过 ref 创建）
  private _isScanRef: Ref<boolean> = ref(false)

  // 普通属性（不会被侦测）
  public normalProp = "普通属性"

  // 通过访问器暴露响应式属性
  get isScan() {
    return this._isScanRef.value
  }
  set isScan(value: boolean) {
    this._isScanRef.value = value
  }

  // 修改方法（保持方法上下文）
  public toggleScan = () => {
    this.isScan = !this.isScan
  }
}
