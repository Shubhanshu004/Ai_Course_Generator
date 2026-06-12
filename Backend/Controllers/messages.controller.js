const pool = require('../Database/db')
const llm = require('../services/groq')




const createMessage = async(req , res) => {
  try{
    const id = parseInt(req.params.id);
    const {content} = req.body;
    const userMessage = await pool.query('insert into messages (session_id , role , content) values ($1 , $2 , $3) RETURNING *',[id , 'user' , content])

    //find if this session has a parent session 
    const sessionQuery = await pool.query('select parent_session_id from sessions where id =$1',[id])
    const parentSessionid = sessionQuery.rows[0]?.parent_session_id;

    //fetch summary from the parent session if it exists
    let parentSummary = '';
    if(parentSessionid){
      const parentSessionQuery = await pool.query('select summary from sessions where id = $1', [parentSessionid])
      parentSummary = parentSessionQuery.rows[0]?.summary || '';
    }

    //construct a system message with the parent summary context 
        const systemMessage = {
      role: 'system',
      content: `You are an expert course tutor. The user is continuing their learning path. 
                ${parentSummary ? `Here is the summary of what they covered in the previous session: "${parentSummary}".` : 'This is their first session.'} 
                Continue the conversation, helping the user learn from where they left off.`
    };

    //fetch the old messages of the current session to maintain the conversation flow 
    const historyResult = await pool.query('select role , content from messages where session_id = $1 order by created_at ASC', [id]);
    
    //combine the system and current chat history
    const groqMessages = [
      systemMessage,...historyResult.rows.map(row => ({role: row.role , content: row.content}))
    ]

    //send message to groq 
    const assistantReply = await llm.generateResponse(groqMessages);
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
