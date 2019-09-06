const Koa = require('koa')
const Router = require('koa-router')
const cors = require('koa2-cors')
const fs = require('fs')
const app = new Koa()
const router = new Router()

router.get('/getSchemeList', async ctx => {
  await cors()
  ctx.body = JSON.parse(fs.readFileSync('./static/schemeItem.json'))
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(3000)
