const pool = require('../Database/db')
const llm = require('../services/groq')
const {summary} = require('../Controllers/sessions.controller')



const createMessage = async(req , res) => {
  try{
    const id = parseInt(req.params.id);
    const {content} = req.body;
    const userMessage = await pool.query('insert into messages (session_id , role , content) values ($1 , $2 , $3) RETURNING *',[id , 'user' , content])

    //fetch the old messages of the particular session
    const historyResult = await pool.query('select role , content from messages where session_id = $1 order by created_at ASC', [id]);
    

    //send message to groq 
    const assistantReply = await llm.generateResponse(historyResult.rows , summary);
    //save groq's reply as the assistant's message in the db

    const assistantMessage = await pool.query(
      'insert into messages (session_id , role , content) values($1 , $2 , $3) RETURNING *', [id , 'assistant', assistantReply]

    )
     res.status(201).json({
      userMessage: userMessage.rows[0],
      assistantMessage: assistantMessage.rows[0]
    });
  }catch(error){
    res.status(500).json({error: error.message})
  }
}

const getMessages = async(req , res) => {
  try{
  const id = parseInt(req.params.id)
  const result = await pool.query('select id , session_id , role , content from messages where session_id = $1', [id])
  if(result.rows.length === 0 ){
    return res.status(404).json({message:"Message Not found"})
  }
  return res.status(200).json({message: result.rows})
}catch(error){
  res.status(500).json({error:error.message})
}
}

module.exports = {createMessage , getMessages}
