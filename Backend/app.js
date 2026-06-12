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
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 15, // strictly limit only 15 messages per 15 minutes to save AI costs
    message: { error: 'You have reached the chat limit. Please wait 15 minutes.' }
});







//routes
app.use('/auth' ,apilimiter,  authRoutes)
app.use('/courses' ,apilimiter ,CoursesRoutes )
app.use('/',chatLimiter , messageRoutes)
app.use('/',apilimiter , sessionRoutes)


module.exports = app