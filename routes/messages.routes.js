const express = require('express')
const router = express.Router()


const messageController = require('../Controllers/messages.controller')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')



router.post('/sessions/:id/messages' , authenticate , messageController.createMessage)
router.get('/sessions/:id/messages' , authenticate , messageController.getMessages)
module.exports = router

