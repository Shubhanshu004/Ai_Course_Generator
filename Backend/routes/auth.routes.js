const express = require('express')
const router = express.Router()
const validate = require('../middleware/validator')
const {signupSchema , loginSchema} = require('../Validators/auth.validator')

const authController = require('../Controllers/auth.controller')

router.post('/signup', validate(signupSchema) , authController.signup)
router.post('/login', validate(loginSchema) , authController.login)

module.exports = router
