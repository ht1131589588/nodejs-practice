module.exports = {
  list: async app => {
    app.ctx.body = "user list"
  },
  detail: async app => {
    app.ctx.body = "user detail"
  }
}
