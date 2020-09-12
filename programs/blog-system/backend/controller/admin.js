module.exports = {
  async list(app) {
    app.ctx.body = `
      <html>
        <div>212323</div>
      </html>
    `
  },
  async detail(app) {
    app.ctx.body = "admin detail"
  }
}
