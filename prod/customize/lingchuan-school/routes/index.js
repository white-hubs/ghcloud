const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const { Mutex } = require('async-mutex');

const router = new Router();
const rootPath = process.cwd();
const jsonFilePath = path.join(rootPath, 'line-config.json');

// 同步读取 JSON 文件
const data = fs.readFileSync(jsonFilePath, 'utf8');
// 解析 JSON 数据
const modelLine = JSON.parse(data);
const lineManager = modelLine.map((item) => {
  return {
    address: item.address,
    maxConnection: item.maxConnection,
    players: []
  };
});
// 创建一个互斥锁实例
const mutex = new Mutex();


// 封装一个通用json返回方法
const json = (code = 200, msg = 'success', data = null) => {
  return {
    code: code,
    msg: msg,
    data: data
  }
}

// 从header中获取authorization字段
const getAuthorization = (ctx) => {
  if (!ctx.header.authorization) {
    ctx.body = json(401, '请先登录')
    return
  }
  return ctx.header.authorization
}

const checkLineTimeout = () => {
  // 基本信息输出
  lineManager.forEach((item) => {
    item.players = item.players.filter((player) => new Date().getTime() - player.time < 60000)
  })
  // 用表格打印出lineManager 不要显示players 但是要显示players的长度
  const printTable = lineManager.map((item) => {
    return {
      ...item,
      players: item.players.length
    }
  })
  // 用表格打印出lineManager
  console.table(printTable)
}

// 获取线路
router.get('/getModelLine', async (ctx, next) => {
  const player = getAuthorization(ctx)
  if (!player) {
    return
  }
  // 等待获取锁
  const release = await mutex.acquire();
  try {
    // 如果当前的player已经在lineManager中，则返回该线路
    const line = lineManager.find((item) => item.players.find((playerInfo) => playerInfo.player === player))
    if (line) {
      // 更新该线路的心跳时间
      const playerIndex = line.players.findIndex((item) => {
        return item.player === player
      })
      playerIndex !== -1 && (line.players[playerIndex].time = new Date().getTime())
      ctx.body = json(200, 'success', line.address)
      return
    }

    // 找出当前连接数最少的服务器
    const minConnection = lineManager.reduce((prev, curr) => {
      return prev.players.length < curr.players.length ? prev : curr
    })
    // 如果当前连接数小于最大连接数，则返回该服务器
    if (minConnection.players.length < minConnection.maxConnection) {
      minConnection.players.push({
        player: player,
        time: new Date().getTime()
      })
      ctx.body = json(200, 'success', minConnection.address)
    } else {
      ctx.body = json(200,'当前无空闲线路', null)
    }
  } finally {
    checkLineTimeout()
    release()
  }
})


// 线路心跳保活 约定30S一次心跳
router.post('/lineHeartBeat', async (ctx, next) => {
  const player = getAuthorization(ctx)
  if (!player) {
    return
  }
  // 从传参中获取线路地址
  const address = ctx.request.body.address
  // 从lineManager中找到该线路
  const line = lineManager.find((item) => {
    return item.address === address
  })
  if (!line) {
    // ctx.status = 404;
    ctx.body = json(200, '线路不存在')
    return
  }
  // 如果该线路存在，则更新该线路的心跳时间
  const playerIndex = line.players.findIndex((item) => {
    return item.player === player
  })
  if (playerIndex === -1) {
    // 补进去
    line.players.push({
      player: player,
      time: new Date().getTime()
    })
  } else {
    line.players[playerIndex].time = new Date().getTime()
  }
  ctx.body = json(200, 'success')
})

// 定时任务，每60S检查一次线路是否超时
setTimeout(checkLineTimeout, 0);
setInterval(checkLineTimeout, 60000)

module.exports = router
