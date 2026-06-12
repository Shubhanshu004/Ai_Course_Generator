const express = require('express')
const authRoutes = require('./routes/auth.routes')
const CoursesRoutes = require('./routes/courses.routes')
const messageRoutes = require('./routes/messages.routes')
const sessionRoutes = require('./routes/sessions.routes')

const app = express()

//middleware
app.use(express.json());

const cors = require('cors')
app.use(cors())

//routes
app.use('/auth' , authRoutes)
app.use('/courses' ,CoursesRoutes )
app.use('/', messageRoutes)
app.use('/', sessionRoutes)


module.exports = app