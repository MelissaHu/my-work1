import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import Vuex from 'vuex'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from './store'

Vue.prototype.$ajax = axios
Vue.L = Vue.prototype.$L = L
Vue.config.productionTip = false
Vue.use(axios)
Vue.use(ElementUI)
Vue.use(Vuex)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
