const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

const authenticate = (req , res, next ) => {
    try{
    const token = req.headers['authorization']?.split(' ')[1]

    if(!token){
        res.status(401).json({error: 'No token provided'})
    }
    const decoded = jwt.verify(token, SECRET_KEY)
    req.user = decoded
    next() 
} catch(error){
    res.status(401).json({error: 'Invalid token'})
}
}
module.exports = authenticate