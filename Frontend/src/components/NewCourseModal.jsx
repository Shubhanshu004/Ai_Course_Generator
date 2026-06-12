import { useState } from 'react'
import { api } from '../api'

export default function NewCourseModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState('Beginner')
  const [pace, setPace] = useState('Normal pace')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.createCourse({ title, topic, level, pace })
      onCreated(data.course)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New course</h2>
        <p className="muted">
          Tell ChainChat what to teach you — it generates a module roadmap and your first session.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. System Design"
            />
          </label>
          <label>
            Topic
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              placeholder="e.g. Low level design"
            />
          </label>
          <label>
            Level
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label>
            Pace
            <select value={pace} onChange={(e) => setPace(e.target.value)}>
              <option>Slow pace</option>
              <option>Normal pace</option>
              <option>Fast pace</option>
            </select>
          </label>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Generating roadmap...' : 'Create course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
