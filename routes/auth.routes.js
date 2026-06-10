const express = require('express')
const router = express.Router()
const validate = require('../middleware/validator')
const {signupSchema , loginSchema} = require('../validators/auth.validator')

const authController = require('../controllers/auth')

router.post('/signup', validate(signupSchema) , authController.signup)
router.post('/login', validate(loginSchema) , authController.login)

module.exports = router
