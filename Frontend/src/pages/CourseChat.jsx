import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import SessionChain from '../components/SessionChain'

export default function CourseChat() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [session, setSession] = useState(null)
  const [sessions, setSessions] = useState([])
  const [viewedSession, setViewedSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState('')

  const scrollRef = useRef(null)

  useEffect(() => {
    loadCourse()
  }, [id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function loadCourse() {
    setLoading(true)
    setError('')
    try {
      // GET /courses/:id returns { course, session }
      // — your backend creates/resumes the active session here.
      const data = await api.getCourse(id)
      setCourse(data.course)
      setSession(data.session)
      setViewedSession(data.session)

      const sessData = await api.getSessions(id)
      setSessions(sessData.Sessions || [])

      if (data.session?.id) {
        const msgData = await api.getMessages(data.session.id)
        setMessages(msgData.message || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectSession(selected) {
    if (sending || ending) return
    setViewedSession(selected)
    setError('')
    try {
      const msgData = await api.getMessages(selected.id)
      setMessages(msgData.message || [])
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || !viewedSession || sending) return

    const content = input.trim()
    setInput('')
    setSending(true)
    setError('')

    // Optimistic update: show the user's message immediately,
    // without waiting for the backend round trip.
    setMessages((prev) => [...prev, { role: 'user', content }])

    try {
      const data = await api.sendMessage(viewedSession.id, content)
      setMessages((prev) => [...prev, data.assistantMessage])
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  async function handleEndSession() {
    if (!session || ending) return
    setEnding(true)
    setError('')
    try {
      await api.endSession(session.id)
      // Re-fetch — backend will hand back a fresh session
      // chained to this one via parent_session_id.
      await loadCourse()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnding(false)
    }
  }

  if (loading) {
    return (
      <div className="chat-page">
        <p className="muted" style={{ padding: '2rem' }}>
          Loading course...
        </p>
      </div>
    )
  }

  if (error && !course) {
    return (
      <div className="chat-page">
        <p className="error" style={{ padding: '2rem' }}>
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <button className="back ghost" onClick={() => navigate('/')}>
          ← Dashboard
        </button>

        <div>
          <h2>{course?.title}</h2>
          <p className="muted">{course?.topic}</p>
        </div>

        <SessionChain 
          sessions={sessions}
          currentSessionId={session?.id}
          viewedSessionId={viewedSession?.id}
          onSelectSession={handleSelectSession}
        />

        <div className="modules">
          <h4>Roadmap</h4>
          {course?.structure?.modules?.map((m, i) => (
            <div key={i} className="module-item">
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <span>{m.title}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <div>
            <span className="session-label mono">Session #{viewedSession?.id}</span>
            {viewedSession?.parent_session_id && viewedSession.parent_session_id !== 'null' && (
              <span className="continue-tag">continuing from #{viewedSession.parent_session_id}</span>
            )}
            {viewedSession?.id !== session?.id && (
              <span className="muted small" style={{ marginLeft: '1rem' }}>(Viewing Historical Session)</span>
            )}
          </div>
          {viewedSession?.id === session?.id && (
            <button className="end-session" onClick={handleEndSession} disabled={ending || messages.length === 0}>
              {ending ? 'Summarizing...' : 'End session & continue later'}
            </button>
          )}
        </header>

        <div className="messages" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="empty-state">
              <p>This session is empty.</p>
              <p className="muted">Ask a question to start studying — ChainChat will pick up the thread next time.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <span className="role mono">{m.role === 'user' ? 'You' : 'ChainChat'}</span>
              <p>{m.content}</p>
            </div>
          ))}

          {sending && (
            <div className="message assistant">
              <span className="role mono">ChainChat</span>
              <p className="typing">thinking...</p>
            </div>
          )}
        </div>

        {error && (
          <p className="error" style={{ padding: '0 1.8rem' }}>
            {error}
          </p>
        )}

        <form className="composer" onSubmit={handleSend}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask, answer, or continue the lesson..."
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
      </main>
    </div>
  )
}
