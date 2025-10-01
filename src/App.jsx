import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [newLesson, setNewLesson] = useState({
    title: '',
    date: '',
    time: '',
    instructor: '',
    capacity: 10
  })

  // Fetch lessons from Supabase
  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('date', { ascending: true })
      
      if (error) throw error
      setLessons(data || [])
    } catch (error) {
      console.error('Error fetching lessons:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([{
          title: newLesson.title,
          date: newLesson.date,
          time: newLesson.time,
          instructor: newLesson.instructor,
          capacity: parseInt(newLesson.capacity)
        }])
        .select()

      if (error) throw error
      
      setLessons([...lessons, ...data])
      setNewLesson({
        title: '',
        date: '',
        time: '',
        instructor: '',
        capacity: 10
      })
    } catch (error) {
      console.error('Error adding lesson:', error.message)
      alert('Errore nell\'aggiunta della lezione: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id)

      if (error) throw error
      setLessons(lessons.filter(lesson => lesson.id !== id))
    } catch (error) {
      console.error('Error deleting lesson:', error.message)
      alert('Errore nella cancellazione della lezione: ' + error.message)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏊 Aquasync</h1>
        <p>Gestione Lezioni in Piscina</p>
      </header>

      <div className="container">
        <section className="add-lesson-section">
          <h2>Aggiungi Nuova Lezione</h2>
          <form onSubmit={handleSubmit} className="lesson-form">
            <div className="form-group">
              <label htmlFor="title">Titolo Lezione:</label>
              <input
                type="text"
                id="title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                placeholder="Es. Nuoto Principianti"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Data:</label>
                <input
                  type="date"
                  id="date"
                  value={newLesson.date}
                  onChange={(e) => setNewLesson({...newLesson, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Ora:</label>
                <input
                  type="time"
                  id="time"
                  value={newLesson.time}
                  onChange={(e) => setNewLesson({...newLesson, time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="instructor">Istruttore:</label>
                <input
                  type="text"
                  id="instructor"
                  value={newLesson.instructor}
                  onChange={(e) => setNewLesson({...newLesson, instructor: e.target.value})}
                  placeholder="Nome istruttore"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Capacità:</label>
                <input
                  type="number"
                  id="capacity"
                  value={newLesson.capacity}
                  onChange={(e) => setNewLesson({...newLesson, capacity: e.target.value})}
                  min="1"
                  max="50"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Aggiungi Lezione</button>
          </form>
        </section>

        <section className="lessons-section">
          <h2>Calendario Lezioni</h2>
          {loading ? (
            <p className="loading">Caricamento...</p>
          ) : lessons.length === 0 ? (
            <p className="no-lessons">Nessuna lezione programmata. Aggiungi la prima!</p>
          ) : (
            <div className="lessons-grid">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="lesson-card">
                  <div className="lesson-header">
                    <h3>{lesson.title}</h3>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(lesson.id)}
                      aria-label="Elimina lezione"
                    >
                      ×
                    </button>
                  </div>
                  <div className="lesson-details">
                    <p><strong>📅 Data:</strong> {new Date(lesson.date).toLocaleDateString('it-IT')}</p>
                    <p><strong>🕐 Ora:</strong> {lesson.time}</p>
                    <p><strong>👨‍🏫 Istruttore:</strong> {lesson.instructor}</p>
                    <p><strong>👥 Capacità:</strong> {lesson.capacity} persone</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
