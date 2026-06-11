const pool = require('../Database/db')
const summaryServices = require('../services/summary')


const sessionSummary = async(req , res) => {
    try{

        const id = parseInt(req.params.id)
        //fetch all the messages related to this session_id
        const allMessages = await pool.query('select role , content from messages where session_id = $1 order by created_at ASC' , [id])

        //generate summary of all the messages

        if(allMessages.rows.length === 0 ){
            return res.status(404).json({ message: "No messages found in this session"})
        }

        const conversationText = allMessages.rows.map(msg => `${msg.role}: ${msg.content}`).join('\n')

        const summary = await summaryServices.summarizeConversation(conversationText)

        await pool.query('update sessions set summary = $1 , status = $2  where id = $3',[summary , 'completed', id])

        res.status(200).json({
            message:"Session summarized and completed successfully",
            summary:summary
        })

    }catch(error){

        res.status(500).json({error:error.message })
    }
}

module.exports = {sessionSummary }
