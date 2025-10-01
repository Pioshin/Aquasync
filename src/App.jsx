import React, { useState, useEffect } from 'react';
import { Calendar, Users, Lock, LogOut, Plus, Trash2, Edit2, Save, X, Waves, School } from 'lucide-react';
import './App.css';

// Supabase imports
import { signIn, signOut, getUsers, createUser, updateUser, deleteUser } from './lib/auth.js';
import { getLessons, createLesson, updateLesson, deleteLesson, updateTeacherAvailability, removeTeacherAvailability } from './lib/lessons.js';

const AquaSync = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showUserManager, setShowUserManager] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '' });
  const [loading, setLoading] = useState(true);

  // Function to reload lessons from database
  const reloadLessons = async () => {
    const { data: lessonsData, error: lessonsError } = await getLessons();
    if (!lessonsError && lessonsData) {
      setLessons(lessonsData);
    }
    return { data: lessonsData, error: lessonsError };
  };

  // Load initial data from Supabase
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);

      // Load users
      const { data: usersData, error: usersError } = await getUsers();
      if (!usersError && usersData) {
        setUsers(usersData);
      }

      // Load lessons
      await reloadLessons();

      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Login component
  const LoginForm = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');

      const { user, error } = await signIn(credentials.username, credentials.password);
      if (error) {
        setError('Credenziali non valide');
      } else {
        setCurrentUser(user);
        setCredentials({ username: '', password: '' });
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-cyan-100 rounded-full mb-4">
              <Waves className="w-12 h-12 text-cyan-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">AquaSync</h1>
            <p className="text-gray-600">Sistema Gestione Lezioni Apnea</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
              Accedi
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Demo: admin/admin123 o marco/teacher123
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Calendar component
  const CalendarView = () => {
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
      return days;
    };

    const formatDateKey = (date) => {
      return date.toISOString().split('T')[0];
    };

    const days = getDaysInMonth(currentMonth);
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                       'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    const previousMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} />;
            
            const dateKey = formatDateKey(day);
            const dayLessons = lessons[dateKey] || [];
            const hasLesson = dayLessons.length > 0;
            const isSelected = selectedDate === dateKey;

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`
                  min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all
                  ${isSelected ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-cyan-300'}
                  ${hasLesson ? 'bg-blue-50' : ''}
                `}
              >
                <div className="font-semibold text-gray-700">{day.getDate()}</div>
                {hasLesson && (
                  <div className="mt-1 space-y-1">
                    {dayLessons.slice(0, 2).map((lesson, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs">
                        <span className="font-mono font-semibold text-gray-700">{lesson.time}</span>
                        {lesson.pool && <Waves className="w-4 h-4 text-blue-600" />}
                        {lesson.classroom && <School className="w-4 h-4 text-green-600" />}
                      </div>
                    ))}
                    {dayLessons.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayLessons.length - 2} altre</div>
                    )}
                    {dayLessons.some(l => l.teachers && l.teachers.length > 0) && (
                      <div className="text-xs text-gray-600">👤 {dayLessons.reduce((total, l) => total + (l.teachers?.length || 0), 0)}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Lesson detail panel
  const LessonPanel = () => {
    // All hooks must be called before any early returns
    const dayLessons = selectedDate ? (lessons[selectedDate] || []) : [];
    const hasLessons = dayLessons.length > 0;

    // Auto-enable editing for admin when no lessons exist
    const shouldAutoEdit = currentUser.role === 'admin' && !hasLessons && selectedDate;

    const [editing, setEditing] = useState(shouldAutoEdit);
    const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
    const [formData, setFormData] = useState({ time: '09:00', pool: false, classroom: false, description: '', teachers: [] });
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    // Current lesson for display/editing
    const currentLesson = hasLessons ? dayLessons[selectedLessonIndex] || dayLessons[0] : null;

    // Local state for teacher notes to avoid losing focus
    const [localNote, setLocalNote] = useState('');

    // Reset editing state when date changes
    useEffect(() => {
      if (!selectedDate) return;

      const dayLessons = lessons[selectedDate] || [];
      const hasLessons = dayLessons.length > 0;
      const shouldAutoEdit = currentUser.role === 'admin' && !hasLessons;

      setEditing(shouldAutoEdit);
      setSelectedLessonIndex(0);
      setIsCreatingNew(false);

      if (hasLessons) {
        setFormData(dayLessons[0]);
        setLocalNote(dayLessons[0].teachers?.find(t => t.name === currentUser.name)?.note || '');
      } else {
        setFormData({ time: '09:00', pool: false, classroom: false, description: '', teachers: [] });
        setLocalNote('');
        setIsCreatingNew(shouldAutoEdit);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, lessons, currentUser.role, currentUser.name]);

    // Update local note when lesson selection changes
    useEffect(() => {
      if (currentLesson) {
        setLocalNote(currentLesson.teachers?.find(t => t.name === currentUser.name)?.note || '');
        setFormData(currentLesson);
      }
    }, [selectedLessonIndex, currentLesson, currentUser.name]);

    // Early return after all hooks
    if (!selectedDate) return null;

    const saveLesson = async () => {
      if (isCreatingNew || !currentLesson) {
        // Create new lesson
        const lessonWithCreator = { ...formData, created_by: currentUser.id };
        const { data, error } = await createLesson(lessonWithCreator, selectedDate);
        if (!error && data) {
          await reloadLessons();
          setIsCreatingNew(false);
        }
      } else {
        // Update existing lesson
        const { data, error } = await updateLesson(currentLesson.id, formData);
        if (!error) {
          await reloadLessons();
        }
      }
      setEditing(false);
    };

    const deleteCurrentLesson = async () => {
      if (!currentLesson) return;

      const { error } = await deleteLesson(currentLesson.id);
      if (!error) {
        await reloadLessons();
        const updatedDayLessons = lessons[selectedDate] || [];
        if (updatedDayLessons.length === 0) {
          setSelectedDate(null);
        } else {
          setSelectedLessonIndex(Math.max(0, selectedLessonIndex - 1));
        }
      }
    };

    const toggleTeacherAvailability = async (type) => {
      if (!currentLesson) return;

      const teacherName = currentUser.name;
      const teachers = currentLesson.teachers || [];
      const existingTeacher = teachers.find(t => t.name === teacherName);

      let newTeachers;
      if (existingTeacher) {
        newTeachers = teachers.map(t =>
          t.name === teacherName
            ? {...t, [type]: !t[type]}
            : t
        );
      } else {
        newTeachers = [...teachers, { name: teacherName, pool: type === 'pool', classroom: type === 'classroom', note: '' }];
      }

      // Update teacher availability in database
      const teacher = users.find(u => u.name === teacherName);
      if (teacher) {
        const availability = {
          pool: type === 'pool' ? !existingTeacher?.[type] : existingTeacher?.pool || false,
          classroom: type === 'classroom' ? !existingTeacher?.[type] : existingTeacher?.classroom || false,
          note: existingTeacher?.note || ''
        };

        const { error } = await updateTeacherAvailability(currentLesson.id, teacher.id, availability);
        if (!error) {
          await reloadLessons();
        }
      }
    };

    const updateTeacherNote = async (note) => {
      if (!currentLesson) return;

      const teacherName = currentUser.name;
      const teacher = users.find(u => u.name === teacherName);
      if (!teacher) return;

      const teachers = currentLesson.teachers || [];
      const existingTeacher = teachers.find(t => t.name === teacherName);

      if (existingTeacher) {
        const availability = {
          pool: existingTeacher.pool,
          classroom: existingTeacher.classroom,
          note: note
        };

        const { error } = await updateTeacherAvailability(currentLesson.id, teacher.id, availability);
        if (!error) {
          await reloadLessons();
        }
      }
    };

    const saveTeacherNote = () => {
      updateTeacherNote(localNote);
    };

    const handleNoteKeyPress = (e) => {
      if (e.key === 'Enter') {
        saveTeacherNote();
      }
    };

    const removeTeacher = async (teacherName) => {
      if (!currentLesson) return;

      const teacher = users.find(u => u.name === teacherName);
      if (!teacher) return;

      const { error } = await removeTeacherAvailability(currentLesson.id, teacher.id);
      if (!error) {
        await reloadLessons();
      }
    };

    const currentTeacher = currentLesson?.teachers?.find(t => t.name === currentUser.name);

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {new Date(selectedDate).toLocaleDateString('it-IT')}
            </h3>
            {hasLessons && (
              <div className="flex gap-2 mt-2">
                {dayLessons.map((lesson, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedLessonIndex(idx)}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${idx === selectedLessonIndex
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                  >
                    {lesson.time}
                  </button>
                ))}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setFormData({ time: '09:00', pool: false, classroom: false, description: '', teachers: [] });
                      setIsCreatingNew(true);
                      setEditing(true);
                    }}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          {currentUser.role === 'admin' && (
            <div className="flex gap-2">
              {!editing ? (
                <>
                  {hasLessons && (
                    <button
                      onClick={() => {
                        setFormData(currentLesson);
                        setIsCreatingNew(false);
                        setEditing(true);
                      }}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                  {hasLessons && (
                    <button
                      onClick={deleteCurrentLesson}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  {!hasLessons && (
                    <button
                      onClick={() => {
                        setIsCreatingNew(true);
                        setEditing(true);
                      }}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      Aggiungi Lezione
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={saveLesson}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setIsCreatingNew(false);
                      if (currentLesson) {
                        setFormData(currentLesson);
                      }
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {currentUser.role === 'admin' && editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orario lezione</label>
              <input
                type="time"
                value={formData.time || '09:00'}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pool}
                  onChange={(e) => setFormData({...formData, pool: e.target.checked})}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
                <Waves className="w-5 h-5 text-blue-600" />
                <span>Piscina</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.classroom}
                  onChange={(e) => setFormData({...formData, classroom: e.target.checked})}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
                <School className="w-5 h-5 text-green-600" />
                <span>Aula</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                rows="3"
                placeholder="Titolo lezione o note..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!hasLessons ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Nessuna lezione programmata per questa data</p>
                {currentUser.role === 'admin' && (
                  <p className="text-sm mt-2">Clicca "Aggiungi Lezione" per crearne una</p>
                )}
              </div>
            ) : (
              <>
                {currentLesson.time && (
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Calendar className="w-5 h-5" />
                    <span>Orario: {currentLesson.time}</span>
                  </div>
                )}
                <div className="flex gap-4 text-lg">
                  {currentLesson.pool && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Waves className="w-6 h-6" />
                      <span>Lezione in Piscina</span>
                    </div>
                  )}
                  {currentLesson.classroom && (
                    <div className="flex items-center gap-2 text-green-600">
                      <School className="w-6 h-6" />
                      <span>Lezione in Aula</span>
                    </div>
                  )}
                </div>
                {currentLesson.description && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{currentLesson.description}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Teacher availability section */}
        {currentUser.role === 'teacher' && currentLesson && (currentLesson.pool || currentLesson.classroom) && (
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800">La tua disponibilità</h4>
            <div className="flex gap-4">
              {currentLesson.pool && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentTeacher?.pool || false}
                    onChange={() => toggleTeacherAvailability('pool')}
                    className="w-5 h-5 text-cyan-600 rounded"
                  />
                  <Waves className="w-5 h-5 text-blue-600" />
                  <span>Disponibile per piscina</span>
                </label>
              )}
              {currentLesson.classroom && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentTeacher?.classroom || false}
                    onChange={() => toggleTeacherAvailability('classroom')}
                    className="w-5 h-5 text-cyan-600 rounded"
                  />
                  <School className="w-5 h-5 text-green-600" />
                  <span>Disponibile per aula</span>
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note personali</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localNote}
                  onChange={(e) => setLocalNote(e.target.value)}
                  onKeyPress={handleNoteKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Aggiungi una nota... (Premi Invio per salvare)"
                />
                <button
                  onClick={saveTeacherNote}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teachers list */}
        {currentLesson && currentLesson.teachers && currentLesson.teachers.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Istruttori disponibili</h4>
            <div className="space-y-2">
              {currentLesson.teachers.map((teacher, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{teacher.name}</div>
                    <div className="flex gap-3 text-sm text-gray-600 mt-1">
                      {teacher.pool && <span className="flex items-center gap-1"><Waves className="w-4 h-4" /> Piscina</span>}
                      {teacher.classroom && <span className="flex items-center gap-1"><School className="w-4 h-4" /> Aula</span>}
                    </div>
                    {teacher.note && <p className="text-sm text-gray-600 mt-1 italic">{teacher.note}</p>}
                  </div>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => removeTeacher(teacher.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Functions for user management
  const handleCreateUser = async () => {
    if (newUser.username && newUser.name) {
      const { data, error } = await createUser(newUser);
      if (!error && data) {
        setUsers([...users, data]);
        setNewUser({ username: '', password: '', name: '' });
      } else {
        console.error('Error creating user:', error);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (user && window.confirm(`Sei sicuro di voler eliminare l'istruttore "${user.name}"?\n\nQuesta azione non può essere annullata.`)) {
      const { error } = await deleteUser(userId);
      if (!error) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        console.error('Error deleting user:', error);
      }
    }
  };

  // User manager (admin only)
  const UserManager = () => {
    // Local state for user editing to avoid losing focus
    const [editingData, setEditingData] = useState({});

    const handleUpdateUser = async (userId, updates) => {
      const { data, error } = await updateUser(userId, updates);
      if (!error && data) {
        setUsers(users.map(u => u.id === userId ? data : u));
        setEditingUser(null);
        setEditingData({});
      } else {
        console.error('Error updating user:', error);
      }
    };

    const startEditing = (user) => {
      setEditingUser(user.id);
      setEditingData({
        username: user.username,
        name: user.name,
        password: ''
      });
    };

    const saveUserChanges = (userId) => {
      const updates = {
        username: editingData.username,
        name: editingData.name
      };
      handleUpdateUser(userId, updates);
    };

    const cancelEditing = () => {
      setEditingUser(null);
      setEditingData({});
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Gestione Utenti</h3>
        
        {/* Create new user */}
        <div className="mb-6 p-4 bg-cyan-50 rounded-lg">
          <h4 className="font-semibold mb-3">Nuovo Istruttore</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Nome completo"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleCreateUser}
            className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Aggiungi Istruttore
          </button>
        </div>

        {/* User list */}
        <div className="space-y-2">
          {users.filter(u => u.role === 'teacher').map(user => (
            <div key={user.id} className="p-4 border border-gray-200 rounded-lg">
              {editingUser === user.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={editingData.username || ''}
                      onChange={(e) => setEditingData({...editingData, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                    <input
                      type="text"
                      value={editingData.name || ''}
                      onChange={(e) => setEditingData({...editingData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveUserChanges(user.id)}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                    >
                      Salva
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-600">@{user.username}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(user)}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main dashboard
  const Dashboard = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Waves className="w-8 h-8 text-cyan-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AquaSync</h1>
                <p className="text-sm text-gray-600">
                  {currentUser.role === 'admin' ? 'Pannello Amministratore' : 'Pannello Istruttore'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium text-gray-800">{currentUser.name}</div>
                <div className="text-sm text-gray-600">{currentUser.role === 'admin' ? 'Admin' : 'Istruttore'}</div>
              </div>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setShowUserManager(!showUserManager)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm
                    ${showUserManager
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-cyan-600 hover:bg-cyan-50 border border-cyan-200'
                    }
                  `}
                  title={showUserManager ? "Torna al calendario" : "Gestisci istruttori"}
                >
                  <Users className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {showUserManager ? 'Calendario' : 'Istruttori'}
                  </span>
                </button>
              )}
              <button
                onClick={() => setCurrentUser(null)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {showUserManager && currentUser.role === 'admin' ? (
            <UserManager />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CalendarView />
              </div>
              <div className="lg:col-span-1">
                {selectedDate ? (
                  <LessonPanel />
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Seleziona una data dal calendario per visualizzare o gestire le lezioni</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>AquaSync © 2025 - Sistema di gestione coordinamento istruttori apnea</p>
        </footer>
      </div>
    );
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-3 bg-cyan-100 rounded-full mb-4">
            <Waves className="w-12 h-12 text-cyan-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AquaSync</h1>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Main render
  if (!currentUser) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

export default AquaSync;