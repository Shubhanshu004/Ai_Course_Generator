export default function SessionChain({ sessions, currentSessionId, viewedSessionId, onSelectSession }) {
  if (!sessions || sessions.length === 0) return null

  return (
    <div className="session-chain" style={{ background: 'transparent', border: 'none', padding: 0 }}>
      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '0.8rem' }}>
        Recent Chats
      </h4>
      <div className="chat-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {sessions.map((sess) => {
          const isViewed = sess.id === viewedSessionId
          const isActive = sess.id === currentSessionId
          
          return (
            <button
              key={sess.id}
              onClick={() => onSelectSession(sess)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                textAlign: 'left',
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                background: isViewed ? 'var(--ink-soft-2)' : 'transparent',
                border: isViewed ? '1px solid var(--accent)' : '1px solid transparent',
                color: isViewed ? 'var(--paper)' : 'var(--paper-dim)',
                cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                fontSize: '0.9rem',
                fontWeight: isViewed ? '600' : 'normal'
              }}
              className="chat-list-item"
              onMouseEnter={(e) => {
                if (!isViewed) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.color = 'var(--paper)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isViewed) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--paper-dim)'
                }
              }}
            >
              {/* Chat bubble icon */}
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ color: isViewed ? 'var(--accent)' : 'var(--muted)', flexShrink: 0 }}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                flex: 1
              }}>
                {sess.title && sess.title !== 'New Chat' ? sess.title : `Chat #${sess.id}`}
              </span>
              {isActive && (
                <span style={{
                  fontSize: '0.65rem',
                  background: 'var(--accent)',
                  color: '#1a1306',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '999px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  Active
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
