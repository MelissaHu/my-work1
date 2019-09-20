import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/index.vue'
import Login from '@/pages/login.vue'
import Register from '@/components/register.vue'
import store from '../store'
Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [{
    path: '/login',
    name: '首页',
    component: Login
  }, {
    path: '/register',
    name: 'register',
    component: Register
  }, {
    path: '/',
    name: '首页',
    component: Home
  }]
})

router.beforeEach((to, from, next) => {
  let token = store.state.login.token
  if (to.meta.requiresAuth) {
    if (token) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
})
export default router
