import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

Vue.prototype.$ajax = axios
Vue.L = Vue.prototype.$L = L
Vue.config.productionTip = false
Vue.use(axios)

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
