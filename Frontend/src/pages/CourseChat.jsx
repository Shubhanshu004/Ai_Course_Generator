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
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              padding: '2rem',
              gap: '0.8rem',
              color: 'var(--paper)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.4rem',
                fontWeight: '500',
                color: 'var(--paper)',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em'
              }}>
                Let's Continue your learning
              </h2>
              <p className="muted" style={{ fontSize: '0.95rem', maxWidth: '460px', lineHeight: '1.6', margin: 0 }}>
                Ask a question, start a module, or clarify a doubt to pick up exactly where you left off.
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                <span className="role mono">{m.role === 'user' ? 'You' : 'ChainChat'}</span>
                <p>{m.content}</p>
              </div>
            ))
          )}

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

        <form 
          className="composer" 
          onSubmit={handleSend}
          style={{
            maxWidth: '760px',
            width: 'calc(100% - 3.6rem)',
            margin: '0 auto 1.5rem',
            background: 'var(--ink-soft)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '0.4rem 0.6rem 0.4rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box',
            borderTop: 'none'
          }}
        >
          <button 
            type="button" 
            style={{ 
              background: 'transparent', 
              color: 'var(--muted)', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '1.4rem',
              cursor: 'pointer',
              fontWeight: 'normal'
            }}
            title="Attach file (visual only)"
            onClick={(e) => e.preventDefault()}
          >
            +
          </button>
          
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={sending}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.6rem 0',
              outline: 'none',
              color: 'var(--paper)',
              fontSize: '0.95rem',
              flex: 1
            }}
          />
          
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ color: 'var(--muted)', cursor: 'pointer', flexShrink: 0 }}
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>

          <button 
            type="submit" 
            disabled={sending || !input.trim()}
            style={{
              background: input.trim() ? 'var(--accent)' : 'var(--ink-soft-2)',
              color: input.trim() ? '#1a1306' : 'var(--muted)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s ease, color 0.2s ease',
              flexShrink: 0
            }}
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </main>
    </div>
  )
}
