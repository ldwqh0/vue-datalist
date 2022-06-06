<template>
  <data-list :list="list" />
</template>
<script lang="ts">
  import Vue from 'vue'
  import DataList from '@/lib/data-list'

  export default Vue.extend({
    components: {
      DataList
    },
    data () {
      return {
        list: [{
          id: 1,
          name: '2'
        }, {
          id: 2,
          name: '2'
        }, {
          id: 3,
          name: '2'
        }]
      }
    }
  })
</script>
