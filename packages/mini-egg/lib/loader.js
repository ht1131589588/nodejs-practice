const fs = require('fs')
const path = require('path')
const Router = require('koa-router')

let appRootPath = process.cwd()

/**
 * 用于修改读取文件目录的根目录节点
 * @param {string} rootPath 
 */
function initAppRootPath(rootPath) {
  appRootPath = rootPath
}

/**
 * 读取指定目录下的文件
 * @param {string} dir 
 * @param {Function} cb 
 */
function load(dir, cb) {
  // 获取绝对路径
  const url = path.resolve(appRootPath, dir)
  // 判断文件夹是否存在
  if(fs.existsSync(url) && fs.statSync(url).isDirectory()) {
    // 读取路径下的文件
    const files = fs.readdirSync(url)
    // 遍历路由文件
    files.forEach(filename => {
      // 只读取js文件
      if (filename.endsWith(".js")) {
        // 去掉后缀名
        filename = filename.replace('.js', '')
        // 导入文件
        const file = require(url + '/' + filename)
        // 回调
        cb(filename, file)
      }
    })
  }
}

/**
 * 初始化路由
 * @param {*} app 
 */
function initRouter(app) {
  // 实例化路由
  const router = new Router()
  load('routes', (filename, routes) => {
    // 若是路由
    // 处理index.js
    const prefix = filename === 'index' ? '' : `/${filename}`
    routes = typeof routes === 'function' ? routes(app) : routes
    // 遍历路由
    Object.keys(routes).forEach(key => {
      const [method, path] = key.split(' ')
      // 添加路由
      // router[method](prefix + path, routes[key])
      router[method](prefix + (path.endsWith('/') ? path.slice(0, path.length - 1) : path), async ctx => {
        // 把ctx挂载至app，使routes和controller中也可以调用ctx
        app.ctx = ctx
        await routes[key](app)
      })
    })
  })

  return router
}

/**
 * 初始化Controller，收集所有controller
 */
function initController(app) {
  const controllers = {}
  load('controller', (filename, controller) => {
    controllers[filename] = controller
  })
  return controllers
}

/**
 * 初始化Services，收集所有service
 */
function initServices() {
  const services = {}
  load('service', (filename, service) => {
    services[filename] = service
  })
  return services
}

/**
 * 加载配置文件
 * @param {Object} app 
 */
function loadConfig(app) {
  load('config', async (filename, config) => {
    // 处理mongoose
    if (config.mongoose) {
      const mongoose = require('mongoose')
      const Schema = mongoose.Schema
      app.mongoose = mongoose
      const mongoDB = `mongodb://${config.mongoose.address}`
      await mongoose.connect(mongoDB, config.mongoose.options || {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      // 加载模型
      app.$model = {}
      load('model', (filename, model) => {
        if (model && typeof model === "function") {
          // const schema = new Schema(schema, options)
          // app.$model[filename] = mongoose.model(filename, schema)
          app.$model[filename] = model(app)
        } else {
          throw new TypeError('model must be a function')
        }
      })
    }

    // 处理中间件
    if (config.middleware && config.middleware.length) {
      config.middleware.forEach(mid => {
        const midpath = path.resolve(__dirname, 'middleware', mid)
        app.$app.use(require(midpath))
      })
    }
  })
}

module.exports = {
  initRouter,
  initController,
  initServices,
  loadConfig,
  initAppRootPath
}
