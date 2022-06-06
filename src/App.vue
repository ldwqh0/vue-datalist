<template>
  <div class="container">
    <div>
      <router-link to="/server">服务器数据</router-link>
      <router-link to="/local">本地数据</router-link>
      <router-link to="/error">错误信息</router-link>
    </div>
    <div>
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
  export default {}
</script>
<style lang="less">
  .container {

  }
</style>
