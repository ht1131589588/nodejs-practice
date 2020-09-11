module.exports = app => ({
  'get /list': app.$ctrl.admin.list,
  'get /detail': app.$ctrl.admin.detail
})
