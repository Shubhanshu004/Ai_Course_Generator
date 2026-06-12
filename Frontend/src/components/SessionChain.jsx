import { Fragment } from 'react'

export default function SessionChain({ sessions, currentSessionId, viewedSessionId, onSelectSession }) {
  if (!sessions || sessions.length === 0) return null

  return (
    <div className="session-chain">
      <h4>This course's thread</h4>
      <div className="chain-track" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0rem', alignItems: 'center' }}>
        {sessions.map((sess, index) => {
          const isViewed = sess.id === viewedSessionId
          
          let nodeClass = 'chain-node'
          if (isViewed) {
            nodeClass += ' active'
          } else {
            nodeClass += ' done'
          }

          return (
            <Fragment key={sess.id}>
              {index > 0 && <div className="chain-line" />}
              <button 
                className={nodeClass} 
                onClick={() => onSelectSession(sess)}
                title={`Session #${sess.id} (${sess.status})${sess.summary && sess.summary !== 'null' ? ` - ${sess.summary.substring(0, 100)}...` : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  padding: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem'
                }}
              >
                {sess.id}
              </button>
            </Fragment>
          )
        })}
      </div>
      <p className="muted small" style={{ marginTop: '0.8rem' }}>
        Click any node to view/chat in that session.
      </p>
    </div>
  )
}
