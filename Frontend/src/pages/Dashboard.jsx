import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import CourseCard from '../components/CourseCard'
import NewCourseModal from '../components/NewCourseModal'

export default function Dashboard() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getCourses()
      // Your getAllCourses controller returns { course: [...] }
      setCourses(data.course || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>⛓ ChainChat</h1>
        <div className="dash-actions">
          <button className="ghost" onClick={() => setShowModal(true)}>
            + New course
          </button>
          <button className="ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      {loading && <p className="muted">Loading your courses...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <div className="empty-state">
          <p>No courses yet.</p>
          <p className="muted">
            Describe what you want to learn and ChainChat builds a roadmap you can study in linked sessions.
          </p>
          <button onClick={() => setShowModal(true)}>Create your first course</button>
        </div>
      )}

      <div className="course-grid">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} onClick={() => navigate(`/courses/${course.id}`)} />
        ))}
      </div>

      {showModal && (
        <NewCourseModal
          onClose={() => setShowModal(false)}
          onCreated={(course) => {
            setShowModal(false)
            navigate(`/courses/${course.id}`)
          }}
        />
      )}
    </div>
  )
}
