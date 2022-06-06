<template>
  <data-list ajax="/users/error">
    <template #error="{error}">{{ error.response }}</template>
  </data-list>
</template>
<script lang="ts">
  import Vue from 'vue'
  import { DataList } from '@/lib/data-list'

  export default Vue.extend({
    components: {
      DataList
    },
    data () {
      return {}
    }
  })
</script>
