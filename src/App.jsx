import React, { useState, useEffect } from 'react';
import { Calendar, Users, Lock, LogOut, Plus, Trash2, Edit2, Save, X, Waves, School, BookOpen, Droplets, User } from 'lucide-react';
import './App.css';

// Supabase imports
import { signIn, signOut, getUsers, createUser, updateUser, deleteUser } from './lib/auth.js';
import { getLessons, createLesson, updateLesson, deleteLesson, updateTeacherAvailability, removeTeacherAvailability } from './lib/lessons.js';
import { getOrganizations } from './lib/organizations.js';

const AquaSync = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showUserManager, setShowUserManager] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '' });
  const [loading, setLoading] = useState(true);

  // Auto-disable loading after 3 seconds as fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Function to reload lessons from database
  const reloadLessons = async () => {
    if (!currentOrganization) return { data: {}, error: null };

    const { data: lessonsData, error: lessonsError } = await getLessons(currentOrganization.id);
    if (!lessonsError && lessonsData) {
      setLessons(lessonsData);
    }
    return { data: lessonsData, error: lessonsError };
  };

  // Load initial data from Supabase when organization changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (!currentOrganization) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Load users
        const { data: usersData, error: usersError } = await getUsers(currentOrganization.id);
        if (!usersError && usersData) {
          setUsers(usersData);
        }

        // Load lessons
        await reloadLessons();
      } catch (error) {
        console.error('Error loading initial data:', error);
      }

      setLoading(false);
    };

    loadInitialData();
  }, [currentOrganization]);

  // Load organizations on component mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const { data: orgsData, error: orgsError } = await getOrganizations();
        if (!orgsError && orgsData && orgsData.length > 0) {
          setOrganizations(orgsData);
        } else {
          // Fallback: create mock organizations for demo
          const mockOrgs = [
            { id: 'test', name: 'TEST - Demo Environment', slug: 'test' },
            { id: 'live', name: 'LIVE - Production Environment', slug: 'live' }
          ];
          setOrganizations(mockOrgs);
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
        // Fallback: create mock organizations for demo
        const mockOrgs = [
          { id: 'test', name: 'TEST - Demo Environment', slug: 'test' },
          { id: 'live', name: 'LIVE - Production Environment', slug: 'live' }
        ];
        setOrganizations(mockOrgs);
      }
    };
    loadOrganizations();
  }, []);

  // Login component
  const LoginForm = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '', organizationId: '' });
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');

      if (!credentials.organizationId) {
        setError('Seleziona un ambiente');
        return;
      }

      const { user, error } = await signIn(credentials.username, credentials.password);
      if (error) {
        setError('Credenziali non valide');
      } else {
        const selectedOrg = organizations.find(org => org.id === credentials.organizationId);
        setCurrentUser(user);
        setCurrentOrganization(selectedOrg);
        setCredentials({ username: '', password: '', organizationId: '' });

        // Force loading state to false after successful login
        setLoading(false);
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Ambiente</label>
              <select
                value={credentials.organizationId}
                onChange={(e) => setCredentials({...credentials, organizationId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              >
                <option value="">Seleziona ambiente...</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
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
        const { data, error } = await createLesson(lessonWithCreator, selectedDate, currentOrganization.id);
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

        const { error } = await updateTeacherAvailability(currentLesson.id, teacher.id, availability, currentOrganization.id);
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

        const { error } = await updateTeacherAvailability(currentLesson.id, teacher.id, availability, currentOrganization.id);
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
      const { data, error } = await createUser(newUser, currentOrganization.id);
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

  // Lessons Summary Component
  const LessonsSummary = () => {
    // Get all lessons from the current month and upcoming
    const getAllLessons = () => {
      const allLessons = [];
      Object.entries(lessons).forEach(([dateKey, dayLessons]) => {
        dayLessons.forEach(lesson => {
          allLessons.push({
            ...lesson,
            date: dateKey,
            dateObj: new Date(dateKey)
          });
        });
      });

      // Sort by date
      return allLessons.sort((a, b) => a.dateObj - b.dateObj);
    };

    const allLessons = getAllLessons();

    const handleEditLesson = (lesson) => {
      setSelectedDate(lesson.date);
    };

    const handleDeleteLesson = async (lessonId) => {
      if (window.confirm('Sei sicuro di voler eliminare questa lezione?')) {
        const { error } = await deleteLesson(lessonId);
        if (!error) {
          await reloadLessons();
        } else {
          console.error('Error deleting lesson:', error);
        }
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Lezioni Programmate</h3>

        {allLessons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <School className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Nessuna lezione programmata</p>
            <p className="text-sm">Seleziona una data dal calendario per aggiungere una lezione</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allLessons.map((lesson, index) => (
              <div key={`${lesson.date}-${lesson.id}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {lesson.description || `Lezione ${lesson.pool ? 'Piscina' : ''} ${lesson.classroom ? 'Aula' : ''}`.trim()}
                      </h4>
                      <div className="flex gap-2">
                        {lesson.pool && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            <Droplets className="w-3 h-3" />
                            <span>Pratica</span>
                          </div>
                        )}
                        {lesson.classroom && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            <BookOpen className="w-3 h-3" />
                            <span>Teoria</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {lesson.pool && lesson.classroom ? 'Corso base apnea - teoria e pratica' :
                       lesson.pool ? 'Allenamento piscina' :
                       lesson.classroom ? 'Lezione teorica' : 'Lezione generica'}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(lesson.date).toLocaleDateString('it-IT', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                      <span>Ore {lesson.time}</span>
                      {lesson.teachers && lesson.teachers.length > 0 && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{lesson.teachers.length} disponibili</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditLesson(lesson)}
                      className="px-3 py-1.5 text-sm text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors border border-cyan-200"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // User manager (admin only)
  const UserManager = () => {
    // Local state for user editing to avoid losing focus
    const [editingData, setEditingData] = useState({});
    // Local state for new user creation to avoid losing focus
    const [localNewUser, setLocalNewUser] = useState({ username: '', name: '', password: '' });

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
        password: user.password || 'teacher123'
      });
    };

    const saveUserChanges = (userId) => {
      const updates = {
        username: editingData.username,
        name: editingData.name,
        password: editingData.password
      };
      handleUpdateUser(userId, updates);
    };

    const cancelEditing = () => {
      setEditingUser(null);
      setEditingData({});
    };

    const handleLocalCreateUser = async () => {
      if (localNewUser.username && localNewUser.name && localNewUser.password) {
        const { data, error } = await createUser(localNewUser, currentOrganization.id);
        if (!error && data) {
          setUsers([...users, data]);
          setLocalNewUser({ username: '', name: '', password: '' }); // Reset local state
          setNewUser({ username: '', password: '', name: '' }); // Reset global state
        } else {
          console.error('Error creating user:', error);
        }
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Gestione Utenti</h3>
        
        {/* Create new user form */}
        <div className="mb-6 p-4 bg-cyan-50 rounded-lg">
          <h4 className="font-semibold mb-3">Nuovo Istruttore</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Username"
              value={localNewUser.username}
              onChange={(e) => setLocalNewUser({...localNewUser, username: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Nome completo"
              value={localNewUser.name}
              onChange={(e) => setLocalNewUser({...localNewUser, name: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={localNewUser.password}
              onChange={(e) => setLocalNewUser({...localNewUser, password: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleLocalCreateUser}
            disabled={!localNewUser.username || !localNewUser.name || !localNewUser.password}
            className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Aggiungi Istruttore
          </button>
        </div>

        {/* Modern table interface */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome Completo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.filter(u => u.role === 'teacher').map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {editingUser === user.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editingData.name || ''}
                            onChange={(e) => setEditingData({...editingData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Nome completo"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editingData.username || ''}
                            onChange={(e) => setEditingData({...editingData, username: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Username"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="password"
                            value={editingData.password || ''}
                            onChange={(e) => setEditingData({...editingData, password: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Password"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => saveUserChanges(user.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-md hover:bg-cyan-700 transition-colors"
                            >
                              Salva
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                            >
                              Annulla
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">@{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">••••••••</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => startEditing(user)}
                              className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 p-2 rounded-md transition-colors"
                              title="Modifica utente"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors"
                              title="Elimina utente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {users.filter(u => u.role === 'teacher').length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Nessun istruttore trovato. Aggiungi il primo istruttore qui sopra.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                  {currentOrganization && (
                    <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      {currentOrganization.slug.toUpperCase()}
                    </span>
                  )}
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
            <div className="space-y-6">
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

              {/* Lessons Summary Section */}
              <LessonsSummary />
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
  if (!currentUser || !currentOrganization) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

export default AquaSync;