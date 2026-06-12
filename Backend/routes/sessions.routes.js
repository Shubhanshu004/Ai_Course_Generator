const express = require('express')
const router = express.Router()


const sessionControllers = require('../Controllers/sessions.controller')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')


router.patch('/sessions/:id' , authenticate , sessionControllers.sessionSummary)


module.exports = router

