// services/summary.js
const { groq } = require('./groq')

const summarizeConversation = async (conversationText) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Summarize the following chat conversation history concisely, capturing the main topics discussed and key takeaways. Return only the summary text.'
      },
      {
        role: 'user',
        content: conversationText
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
  })
  return completion.choices[0]?.message?.content || ''
}

module.exports = { summarizeConversation }
