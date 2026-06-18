const express = require('express')
const authRoutes = require('./routes/auth.routes')
const CoursesRoutes = require('./routes/courses.routes')
const messageRoutes = require('./routes/messages.routes')
const sessionRoutes = require('./routes/sessions.routes')
const rateLimit = require('express-rate-limit')
const cors = require('cors')

const app = express()

//middleware
app.use(express.json());



app.use(cors())

//rate limiter
const apilimiter = rateLimit({
    windowMs: 15*60*1000 , 
    max: 100,
    message: {error: 'Too many requests , please try again later'}
})








//routes
app.use('/auth' ,apilimiter,  authRoutes)
app.use('/courses' ,apilimiter ,CoursesRoutes )
app.use('/' , messageRoutes)
app.use('/',apilimiter , sessionRoutes)


module.exports = app