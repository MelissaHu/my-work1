import axios from 'axios'

const API_HOST = 'http://127.0.0.1:8000/'
// const MAMINCHAO_HOST = 'http://86.85.106.27:8082/'

axios.defaults.headers.post['Content-Type'] =
    'application/x-www-form-urlencoded'

// 请求拦截器
axios.interceptors.request.use(
  function (config) {
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)

export async function getNewTest () {
  console.log('sfdsfdfsd')
  const data = await axios.get(`${API_HOST}getSchemeList`)
  console.log('data', data)
  // return data
}
