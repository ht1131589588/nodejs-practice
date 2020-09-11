/**
 * 实现自动读取对应目录文件，把读取到的信息挂载到实例
 */
const Koa = require('koa')
const detect = require('detect-port')
const internalIp = require("internal-ip")
const {
  initAppRootPath,
  initRouter,
  initController,
  initServices,
  loadConfig
} = require('./loader')

class App {
  constructor(conf = {}) {
    const { rootPath = process.cwd(), ...koaConfig } = conf
    // 设置路径
    initAppRootPath(rootPath)
    // 生成koa app
    this.$app = new Koa(koaConfig)
    // 读取config配置项
    loadConfig(this)
    // 初始化service
    this.$service = initServices(this)
    // 初始化controller
    this.$ctrl = initController(this)
    // 初始化路由
    this.$router = initRouter(this)
    // 把路由加入应用
    this.$app.use(this.$router.routes()).use(this.$router.allowedMethods())
  }

  // 启动应用
  async start(port) {
    const IP = await internalIp.v4()
    const PORT = await detect(port)
    this.$app.listen(PORT, () => {
      console.log(`server run at http://localhost:${PORT}`)
      console.log(`server run at http://${IP}:${PORT}`)
    })
  }
}

module.exports = App
