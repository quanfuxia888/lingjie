// api/types/response.d.ts
/**
 * 标准后端响应结构
 * @template T 数据类型泛型
 */
export interface BaseResponse<T = any> {
  code: number;    // 业务状态码
  data: T;         // 核心数据
  msg?: string;// 可选提示信息
  timestamp?: number; // 可选扩展字段
}

// 业务错误类型
export interface BusinessError {
  code: number;
  msg: string;
}