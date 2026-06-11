const express = require('express')
const authRoutes = require('./routes/auth.routes')
const CoursesRoutes = require('./routes/courses.routes')
const messageRoutes = require('./routes/messages.routes')

const app = express()

//middleware
app.use(express.json());

//routes
app.use('/auth' , authRoutes)
app.use('/courses' ,CoursesRoutes )
app.use('/', messageRoutes)


module.exports = app