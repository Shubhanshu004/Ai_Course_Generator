const express = require('express')
const router = express.Router()

const coursesController = require('../Controllers/courses.controller')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')


router.post('/' , authenticate , coursesController.createCourse)
router.get('/' , authenticate , coursesController.getAllCourses)
router.get('/:id' , authenticate , coursesController.getCoursebyId)

module.exports = router

