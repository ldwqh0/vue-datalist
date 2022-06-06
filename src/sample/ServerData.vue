<template>
  <div>
    <form>
      <label>搜索关键字<input v-model="serverParams.keywords"></label>
    </form>
    <data-list ajax="/users" :server-params="serverParams" :sort="sort" />
  </div>
</template>
<script lang="ts">
  import DataList from '@/lib/data-list/DataList.vue'

  export default {
    components: {
      DataList
    },
    methods: {},
    data () {
      return {
        sort: [{
          prop: 'name',
          order: 'asc'
        }, {
          prop: 'age',
          order: 'desc'
        }],
        serverParams: {
          keywords: ''
        }
      }
    }
  }
</script>
