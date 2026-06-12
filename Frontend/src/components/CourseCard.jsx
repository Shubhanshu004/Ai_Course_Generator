export default function CourseCard({ course, onClick }) {
  const moduleCount = course.structure?.modules?.length || 0

  return (
    <button className="course-card" onClick={onClick}>
      <span className="tag">{course.level}</span>
      <h3>{course.title}</h3>
      <p className="muted">{course.topic}</p>
      <div className="card-footer">
        <span className="mono">{moduleCount} modules</span>
        <span>{course.pace}</span>
      </div>
    </button>
  )
}
