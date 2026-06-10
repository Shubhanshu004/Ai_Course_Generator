const pool = require('../Database/db')
const llm = require('../services/groq')

const createCourse = async(req , res) => {
  try{
    const id = req.user.id
    const{title , topic , level , pace} = req.body
    const structure = await llm.generateCourse({title , topic , level , pace})
    const result = await pool.query('insert into courses (user_id , title , topic, level , pace, structure) values ($1 , $2 , $3 , $4 , $5 , $6) RETURNING* ', [id , title , topic , level , pace , structure])

    res.status(201).json({message:"Course crated successfully" , course: result.rows[0]})
  }catch(error){
    res.status(500).json({error:'Something went wrong'})
  }
}





module.exports = {createCourse}