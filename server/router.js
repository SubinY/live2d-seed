const express = require('express')
let router = express.Router()
const controller = require('./controller')

// middleware that is specific to this router
if (process.env.NODE_ENV === 'development') {
  router.use(function timeLog(req, res, next) {
    next()
  })
}

// 项目信息
router.post('/voice/toText', controller.voice.toText)
router.post('/voice/toTextByBack', controller.voice.toTextByBack)
router.get('/record/record', controller.record.record)

module.exports = router
