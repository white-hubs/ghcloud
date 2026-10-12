const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger')
const cors = require('koa-cors');
const index = require('./routes/index')

// 环境变量
const portIndex = process.argv.indexOf('--port');
if (portIndex!== -1 && process.argv[portIndex + 1]) {
  process.env.PORT  = process.argv[portIndex + 1];
}
process.env.PORT = process.env.PORT || 3000;

process.title = 'lingchuan-school-model-line-manager';

// 开发环境下允许跨域
// if (process.env.NODE_ENV === 'development') {
//   app.use(cors())
// }
app.use(cors())

// middlewares
app.use(bodyParser())
app.use(json())
app.use(logger())


// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
})

// routes
app.use(index.routes(), index.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
});

module.exports = app
