# 仿egg实现的一个基于koa的nodejs框架

目录结构：

```bash
.
├── README.md # 说明文档
├── index.js # 入口文件
├── lib # 实现的核心代码
│   ├── loader.js # 加载模块
│   └── main.js # 主实现
└── package.json # 包信息
```

依赖说明：

- `koa`: nodejs 框架
- `koa-router`: 路由中间件
- `internal-ip`: 获取本机ip的工具
- `detect-port`: 生成端口，用于在当前端口被占用的时候返回一个新的未被占用的端口号

具体实现：

## `loader.js` 加载器

用于初始化加载各个模块(controller/routes/services/models)

内部实现了一个`load`方法，用于读取js模块，并返回文件名和内容：

```js
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
```

然后基于 `load` 方法，来实现对不同模块的加载，如果不存在对应的文件夹，则不会进行加载。

具体的加载方法有如下几个：

- `initAppRootPath` 用于初始化/修改读取文件的跟路径，可以是绝对，也可以是相对
- `initRouter` 初始化路由模块，调用`load` 方法加载`routes` 文件夹
- `initController` 初始控制器模块，调用`load` 方法加载`controller` 文件夹
- `initServices` 初始化路由模块，调用`load` 方法加载`services` 文件夹
- `loadConfig` 初始化路由模块，调用`load` 方法加载`config` 文件夹，一般只需要一个config文件

## `main.js` 应用启动入口

主要功能会初始化一个生成一个Koa的应用实例，并开始加载 `config` 配置项，并初始化 `services` 、`controller` 、 `router` 对应的模块，如果对应的模块不存在则不会加载。

生成应用实例时，并不会立即启动应用，需要调用实例的`start`方法来启动，该方法会进行以下操作：

- 获取 Ip 地址
- 检查 `PORT` 是否被使用，如果被使用则会按顺序返回一个未被使用的端口号
- 用Koa实例监听端口号，启动服务
