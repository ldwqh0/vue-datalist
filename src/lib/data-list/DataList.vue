<template>
  <div v-if="showError && error" class="data-list">
    <slot name="error" :error="error">
      <div class="data-list-error">
        {{ error }}
      </div>
    </slot>
  </div>
  <div v-else class="data-list">
    <slot name="default" :data="data_">
      <div class="data-list-list">
        <div v-for="item in data_"> {{ item }}</div>
      </div>
    </slot>
    <slot name="pagination" :pagination="pagination" :total="total">
      <div class="data-list-pagination">
        <a href="javascript:void(0)" @click="pagination.page--">上一页</a>
        当前第: {{ pagination.page }}页，每页<input v-model="pagination.size">条，共{{ total }}条
        <a href="javascript:void(0)" @click="pagination.page++">下一页</a>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
  import Vue, { PropType } from 'vue'
  import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
  import cloneDeep from 'lodash/cloneDeep'
  import qs from 'qs'
  import config from './config'
  import isNil from 'lodash/isNil'
  import { AjaxFunction, ErrorResponseData, Pagination, RangePage, Sort } from '../../../types'

  export default Vue.extend({
    props: {
      /**
       * 本地数据列表
       */
      list: {
        required: false,
        type: [Array] as PropType<any[] | null>,
        default: (): any[] | null => null
      },
      /**
       * 发送请求的实例
       */
      http: {
        type: [Function] as PropType<AxiosInstance | null>,
        required: false,
        default: null
      },
      /**
       * ajax配置类，可以是方法，函数，或者一个对象
       */
      ajax: {
        required: false,
        default: null,
        type: [Object, String, Function] as PropType<string | AjaxFunction | AxiosRequestConfig | null>
      },
      serverParams: {
        required: false,
        default: (): any => ({}),
        type: [Object] as PropType<Record<string, any>>
      },
      saveState: { // 是否保存列表状态
        required: false,
        default: (): boolean => false,
        type: [Boolean, String]
      },
      debounceTime: {
        required: false,
        type: [Number] as PropType<number>,
        default: (): number => 500
      },
      sort: {
        type: [Object, Array] as PropType<Sort | Sort[] | null>,
        default: () => ([]),
        required: false
      },
      showError: {
        type: [Boolean] as PropType<boolean>,
        default: () => true,
        required: false,
      }
    },
    data (): {
      // 防抖的计数器，这个不在实例中体现，
      timeout?: number,
      loading: boolean,
      draw: number,
      response: AxiosResponse<RangePage | ErrorResponseData>,
      error?: AxiosError | Error | null,
      pagination: Pagination
    } {
      return {
        loading: false,
        draw: 0,
        response: {
          status: 200,
          statusText: '',
          headers: {},
          config: {},
          data: {
            max: 0,
            content: [],
            totalElements: 0,
            number: 0,
            size: 10
          }
        },
        error: null,
        pagination: {
          page: 1,
          size: 10,
        }
      }
    },
    computed: {
      // 构建排序属性
      sort_ (): string[] {
        const createSort = ({ prop, order = 'asc' }: Sort = {}): string | undefined => {
          if (isNil(prop)) {
            console.debug('the sort prop can not be undefined or null')
          } else {
            if (order === 'ascending' || order === 'asc') {
              return `${prop},asc`
            }
            if (order === 'descending' || order === 'desc') {
              return `${prop},desc`
            }
          }
        }
        if (Array.isArray(this.sort)) {
          return (this.sort as Sort[]).map(sort => createSort(sort)).filter((v): v is string => v !== undefined)
        }
        if ((typeof this.sort) === 'object') {
          const result = createSort(this.sort as Sort)
          if (result !== undefined) {
            return [result]
          }
        }
        return []
      },
      /**
       * 构建显示的数据
       */
      data_ (): any[] {
        if (!isNil(this.list)) {
          const total = this.list.length
          let max = this.pagination.size * this.pagination.page
          max = max > total ? total : max
          const result = this.list.slice((this.pagination.page - 1) * this.pagination.size, max)
          this.$emit('data-change', result)
          return result
        } else {
          const result = (this.response.data as RangePage).content ?? []
          this.$emit('data-change', result)
          return result
        }
      },
      /**
       * 构建服器查询参数
       */
      params_ (): Record<string, any> {
        return {
          ...this.serverParams,
          page: this.pagination.page - 1,
          size: this.pagination.size,
          sort: this.sort_
        }
      },

      ajax_ (): AxiosRequestConfig | null {
        // 如果传入的ajax是一个函数，需要调用该函数构建ajax请求需要的对象
        if (!isNil(this.ajax)) {
          if (typeof this.ajax === 'function') {
            const sort: Sort[] = []
            if (Array.isArray(this.sort)) {
              sort.push(...this.sort)
            }
            if ((typeof this.sort) === 'object') {
              sort.push(this.sort as Sort)
            }
            return this.ajax(this.pagination, this.serverParams, sort)
          } else if (typeof this.ajax === 'object') {
            const ajax = cloneDeep(this.ajax)
            if (ajax.params === undefined || ajax.params === null) {
              ajax.params = {}
            }
            ajax.params = {
              ...ajax.params,
              ...this.params_
            }
            return ajax
          } else {
            return {
              url: this.ajax,
              method: 'get',
              params: this.params_,
              paramsSerializer: (v) => qs.stringify(v, { arrayFormat: 'repeat' })
            }
          }
        }
        return null
      },

      total (): number {
        if (!isNil(this.list)) {
          return this.list?.length
        } else {
          return (this.response.data as RangePage).totalElements ?? 0
        }
      },
    },
    watch: {
      ajax_ () {
        this.debounceReload()
      },
      // 当传入参数改变时，显示第1页
      serverParams: {
        handler () {
          this.pagination.page = 1
        },
        deep: true
      },
      /**
       * 当每页长度改变时，显示第一页
       */
      'pagination.size' () {
        this.pagination.page = 1
      },
      /**
       * 当请求相关的配置改变时，显示第一页
       */
      ajax () {
        this.pagination.page = 1
      },
    },
    created () {
      this.reloadAjaxData()
    },
    beforeDestroy () {
      if (this.timeout) {
        window.clearTimeout(this.timeout)
      }
    },
    methods: {
      reloadAjaxData (): void {
        this.error = null
        if (!isNil(this.ajax_)) {
          const http = this.http || config.httpInstance
          this.$emit('loading')
          if (!isNil(this.ajax_?.params)) {
            (this.ajax_! as any).draw = ++this.draw
          }
          http.request(this.ajax_)
            .then((response: AxiosResponse) => {
              if ((response.config as any).draw === this.draw) {
                this.response = response
                this.$emit('success', response.data)
              }
            })
            .catch((e: AxiosError) => {
              if (e.isAxiosError && (e.config as any).draw === this.draw) {
                this.error = e
                this.$emit('error', e)
              } else {
                throw e
              }
            })
            .finally(() => this.$emit('complete'))
        }
      },
      /**
       * 立即刷新数据
       */
      reloadData () {
        if (this.timeout) {
          window.clearTimeout(this.timeout)
        }
        this.timeout = window.setTimeout(this.reloadAjaxData)
      },
      debounceReload () {
        if (this.timeout) {
          window.clearTimeout(this.timeout)
        }
        this.timeout = window.setTimeout(this.reloadAjaxData, this.debounceTime)
      }
    }
  })
</script>

<style scoped>

</style>
