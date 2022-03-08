import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import AsyncComputed from 'vue-async-computed'
 
/* Initialize the plugin */
Vue.use(AsyncComputed)
 
Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
