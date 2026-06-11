const pool = require('../Database/db')
const llm = require('../services/groq')
const summary = require('../services/summary')

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
const getAllCourses = async(req , res) => {
  try{
    const userId = req.user.id
    const result = await pool.query(
      'SELECT id, user_id, title, topic, level, pace, structure FROM courses WHERE user_id = $1',
      [userId]
    )
    res.status(200).json({
      message:"Courses fetched successfully", 
      course: result.rows
    })
  }catch(error){
    res.status(500).json({error: error.message})
  }
}

const getCoursebyId = async(req ,res)=> {
  try{
    const id = parseInt(req.params.id)
    const result = await pool.query('select id , user_id , title , topic , level , pace , structure from courses where id = $1', [id])
    if(result.rows.length === 0){
      return res.status(404).json({message:"No Course found"})
    }
   
    const checkStatus = await pool.query('SELECT id, status FROM sessions WHERE course_id = $1 ORDER BY created_at DESC LIMIT 1' , [id])
    let session;
    if(!checkStatus.rows[0]){
       session = await pool.query(
        'INSERT INTO sessions (course_id, user_id, parent_session_id, summary, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, req.user.id, null , 'null', 'active']
      )
    } else if(checkStatus.rows[0].status!== 'active'){
       session = await pool.query(
        'INSERT INTO sessions (course_id, user_id, parent_session_id, summary, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, req.user.id, checkStatus.rows[0].id , 'null', 'active']
      )
    }else{
      return res.status(200).json({ course: result.rows[0], session: checkStatus.rows[0] })
    }
    return res.status(200).json({ course: result.rows[0], session: session.rows[0] })
  }catch(error){
    return res.status(500).json({error: error.message})
  }
}


module.exports = {createCourse , getAllCourses , getCoursebyId}