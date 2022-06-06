import App from './App.vue'
import Vue from 'vue'
import router from './router'

Vue.config.productionTip = false
console.log('Created By ldwqh0@outlook.com')
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
