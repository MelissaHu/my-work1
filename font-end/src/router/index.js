import Vue from 'vue'
import Router from 'vue-router'
import MainMap from '@/components/mainMap'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: '首页',
    component: MainMap
  }]
})
