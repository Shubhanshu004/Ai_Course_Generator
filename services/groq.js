require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const generateCourse = async ({ title, topic, level, pace }) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are an expert course designer. Create structured, practical course content with clear modules and lessons. Return valid JSON only, with no markdown fences.',
      },
      {
        role: 'user',
        content: `Create a course with:
- Title: ${title}
- Topic: ${topic}
- Level: ${level}
- Pace: ${pace}

Return JSON in this shape:
{
  "title": "string",
  "description": "string",
  "modules": [
    {
      "title": "string",
      "lessons": [
        { "title": "string", "content": "string" }
      ]
    }
  ]
}`,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
  })

  const raw = completion.choices[0]?.message?.content || ''
  try {
    return JSON.parse(raw)
  } catch {
    return { raw }
  }
}

module.exports = { generateCourse }

if (require.main === module) {
  generateCourse({
    title: 'Introduction to JavaScript',
    topic: 'JavaScript fundamentals',
    level: 'beginner',
    pace: 'self-paced',
  })
    .then((course) => console.log(JSON.stringify(course, null, 2)))
    .catch((error) => console.error(error.message))
}
