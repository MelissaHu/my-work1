const Koa = require('koa')
const Router = require('koa-router')
const cors = require('koa2-cors')
const fs = require('fs')
const app = new Koa()
const router = new Router()

app.use(cors({
    origin: function(ctx) {
        if (ctx.url === '/test') {
            return "*"; // 允许来自所有域名请求
        }
        return 'http://localhost:9000'; // 这样就能只允许 http://localhost:8080 这个域名的请求了
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))


router.get('/getSchemeList', async ctx => {
    //await cors()
    ctx.body = JSON.parse(fs.readFileSync('./static/schemeItem.json'))
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(3000)