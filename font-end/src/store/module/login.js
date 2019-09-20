const Login = {
  state: {
    token: window.sessionStorage.getItem('token'),
    username: ''
  },

  mutations: {
    LOGIN: (state, data) => {
      state.token = data
      window.sessionStorage.setItem('token', data)
    },
    LOGOUT: (state) => {
      state.token = null
      window.sessionStorage.removeItem('token')
    },
    USERNAME: (state, data) => {
      state.username = data
      window.sessionStorage.setItem('username', data)
    }
  },
  actions: {
    UserLogin ({ commit }, data) {
      commit('LOGIN', data)
    },
    UserLogout ({ commit }) {
      commit('LOGOUT')
    },
    UserName ({ commit }, data) {
      commit('USERNAME', data)
    }
  }

}

export default Login
