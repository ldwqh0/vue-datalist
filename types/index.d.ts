import _Vue, { PluginObject } from 'vue'
import { AxiosInstance, AxiosRequestConfig } from 'axios'

export interface PluginConfig {
  httpInstance: AxiosInstance
}

/**
 * 排序信息
 */
export interface Sort {
  prop?: string,
  order?: string
}

export interface ErrorResponseData {
  error?: string,
  message?: string,
  path?: string,
  status?: number,
  timestamp?: string
}

/**
 * 分页查询的响应体
 */
export interface RangePage<T = any> {
  /**
   * 某个查询序列中的最大值
   */
  max?: number,
  /**
   * 数据内容
   */
  content: T[],

  /**
   * 一次查询元素总数
   */
  totalElements: number,

  /**
   * 页码，从0开始
   */
  number: number,

  /**
   * 每页大小
   */
  size: number,

}

export interface Pagination {
  page: number,
  size: number
}

export interface AjaxFunction {
  (pagination: Pagination, sererParams: Record<string, any>, sort: Sort[],): AxiosRequestConfig
}

export declare class DataList extends _Vue {

}

export const config: PluginConfig
declare const plugin: PluginObject<PluginConfig>
export default plugin
