import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Waves,
  School,
  BookOpen,
  Droplets,
  User,
  BarChart3,
  ChevronDown,
  Eye,
  EyeOff,
  Bell,
  Repeat,
} from 'lucide-react';
import './App.css';

// Supabase imports
import { signIn, getUsers, createUser, updateUser, deleteUser } from './lib/auth.js';
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  updateTeacherAvailability,
  removeTeacherAvailability,
} from './lib/lessons.js';
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
  const [showSummary, setShowSummary] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '' });
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMonthSummary, setSelectedMonthSummary] = useState(new Date());
  const [selectedMonthLessons, setSelectedMonthLessons] = useState(new Date());

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
            { id: 'live', name: 'LIVE - Production Environment', slug: 'live' },
          ];
          setOrganizations(mockOrgs);
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
        // Fallback: create mock organizations for demo
        const mockOrgs = [
          { id: 'test', name: 'TEST - Demo Environment', slug: 'test' },
          { id: 'live', name: 'LIVE - Production Environment', slug: 'live' },
        ];
        setOrganizations(mockOrgs);
      }
    };
    loadOrganizations();
  }, []);

  // Login component
  const LoginForm = () => {
    const [credentials, setCredentials] = useState({
      username: '',
      password: '',
      organizationId: '',
    });
    const [error, setError] = useState('');

    const handleLogin = async e => {
      e.preventDefault();
      setError('');

      if (!credentials.organizationId) {
        setError('Seleziona un ambiente');
        return;
      }

      // Get organization slug for authentication
      const selectedOrg = organizations.find(org => org.id === credentials.organizationId);
      const organizationSlug = selectedOrg?.slug;

      const { user, error } = await signIn(
        credentials.username,
        credentials.password,
        organizationSlug
      );
      if (error) {
        setError(error);
      } else {
        setCurrentUser(user);
        setCurrentOrganization(user.organization || selectedOrg);
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
                onChange={e => setCredentials({ ...credentials, organizationId: e.target.value })}
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
                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
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
    const getDaysInMonth = date => {
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

    const formatDateKey = date => {
      return date.toISOString().split('T')[0];
    };

    const days = getDaysInMonth(currentMonth);
    const monthNames = [
      'Gennaio',
      'Febbraio',
      'Marzo',
      'Aprile',
      'Maggio',
      'Giugno',
      'Luglio',
      'Agosto',
      'Settembre',
      'Ottobre',
      'Novembre',
      'Dicembre',
    ];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    // Calculate uncovered lessons
    const uncoveredLessons = [];
    Object.entries(lessons).forEach(([dateKey, dayLessons]) => {
      dayLessons.forEach(lesson => {
        if (!lesson.teachers || lesson.teachers.length === 0) {
          uncoveredLessons.push({
            ...lesson,
            date: dateKey,
            dateObj: new Date(dateKey),
          });
        }
      });
    });

    const previousMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Alert for uncovered lessons */}
        {uncoveredLessons.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800">
                  Attenzione: Lezioni senza istruttore
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  Ci sono <span className="font-bold">{uncoveredLessons.length}</span> lezioni che
                  non hanno ancora disponibilità da parte degli istruttori.
                </p>
              </div>
            </div>
          </div>
        )}

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
            const isToday = formatDateKey(new Date()) === dateKey;

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`
                  min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all
                  ${isToday ? 'border-4 border-blue-500 bg-blue-50' : ''}
                  ${isSelected ? 'border-cyan-500 bg-cyan-50' : isToday ? '' : 'border-gray-200 hover:border-cyan-300'}
                  ${hasLesson && !isToday ? 'bg-blue-50' : ''}
                `}
              >
                <div
                  className={`font-semibold ${isToday ? 'text-blue-600 text-lg' : 'text-gray-700'}`}
                >
                  {day.getDate()}
                </div>
                {hasLesson && (
                  <div className="mt-1 space-y-1">
                    {dayLessons.slice(0, 2).map((lesson, idx) => {
                      const isUncovered = !lesson.teachers || lesson.teachers.length === 0;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-1 text-xs ${isUncovered ? 'border-2 border-red-500 rounded px-1 py-0.5 bg-red-50' : ''}`}
                        >
                          <span className="font-mono font-semibold text-gray-700">
                            {lesson.time}
                          </span>
                          {lesson.pool && <Waves className="w-4 h-4 text-blue-600" />}
                          {lesson.classroom && <School className="w-4 h-4 text-green-600" />}
                        </div>
                      );
                    })}
                    {dayLessons.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayLessons.length - 2} altre</div>
                    )}
                    {dayLessons.some(l => l.teachers && l.teachers.length > 0) && (
                      <div className="text-xs text-gray-600">
                        👤 {dayLessons.reduce((total, l) => total + (l.teachers?.length || 0), 0)}
                      </div>
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
    const dayLessons = selectedDate ? lessons[selectedDate] || [] : [];
    const hasLessons = dayLessons.length > 0;

    // Auto-enable editing for admin when no lessons exist
    const shouldAutoEdit = currentUser.role === 'admin' && !hasLessons && selectedDate;

    const [editing, setEditing] = useState(shouldAutoEdit);
    const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
    const [formData, setFormData] = useState({
      time: '09:00',
      pool: false,
      classroom: false,
      description: '',
      teachers: [],
      isRecurring: false,
      recurrenceType: 'weekly',
      recurrenceInterval: 1,
      recurrenceEnd: null,
      recurrenceLabel: '',
    });
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
        setFormData({
          time: '09:00',
          pool: false,
          classroom: false,
          description: '',
          teachers: [],
          isRecurring: false,
          recurrenceType: 'weekly',
          recurrenceInterval: 1,
          recurrenceEnd: null,
          recurrenceLabel: '',
        });
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
        // Create new lesson(s)
        const lessonWithCreator = { ...formData, created_by: currentUser.id };

        if (formData.isRecurring) {
          // Generate a unique ID for this recurrence series
          const recurrenceId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Create recurring lessons
          const dates = generateRecurringDates(
            selectedDate,
            formData.recurrenceType,
            formData.recurrenceInterval,
            formData.recurrenceEnd
          );

          // Create lesson for each date with the same recurrence_id and label
          for (const date of dates) {
            const lessonData = {
              ...lessonWithCreator,
              recurrence_id: recurrenceId,
              recurrence_label: formData.recurrenceLabel || null,
            };
            await createLesson(lessonData, date, currentOrganization.id);
          }

          await reloadLessons();
          setIsCreatingNew(false);
        } else {
          // Create single lesson
          const { data, error } = await createLesson(
            lessonWithCreator,
            selectedDate,
            currentOrganization.id
          );
          if (!error && data) {
            await reloadLessons();
            setIsCreatingNew(false);
          }
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

    // Generate recurring dates based on recurrence settings
    const generateRecurringDates = (startDate, type, interval, endDate) => {
      const dates = [startDate];
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : null;

      // Limit to max 52 occurrences to avoid infinite loops
      const maxOccurrences = 52;
      let currentDate = new Date(start);

      for (let i = 0; i < maxOccurrences; i++) {
        switch (type) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + interval);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7 * interval);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + interval);
            break;
          case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + interval);
            break;
          default:
            return dates;
        }

        // Check if we've reached the end date
        if (end && currentDate > end) break;

        // Add date in YYYY-MM-DD format
        const dateStr = currentDate.toISOString().split('T')[0];
        dates.push(dateStr);
      }

      return dates;
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

    const toggleTeacherAvailability = async type => {
      if (!currentLesson) return;

      const teacherName = currentUser.name;
      const teachers = currentLesson.teachers || [];
      const existingTeacher = teachers.find(t => t.name === teacherName);

      let newTeachers;
      if (existingTeacher) {
        newTeachers = teachers.map(t => (t.name === teacherName ? { ...t, [type]: !t[type] } : t));
      } else {
        newTeachers = [
          ...teachers,
          { name: teacherName, pool: type === 'pool', classroom: type === 'classroom', note: '' },
        ];
      }

      // Update teacher availability in database
      const teacher = users.find(u => u.name === teacherName);
      if (teacher) {
        const availability = {
          pool: type === 'pool' ? !existingTeacher?.[type] : existingTeacher?.pool || false,
          classroom:
            type === 'classroom' ? !existingTeacher?.[type] : existingTeacher?.classroom || false,
          note: existingTeacher?.note || '',
        };

        const { error } = await updateTeacherAvailability(
          currentLesson.id,
          teacher.id,
          availability,
          currentOrganization.id
        );
        if (!error) {
          await reloadLessons();
        }
      }
    };

    const updateTeacherNote = async note => {
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
          note: note,
        };

        const { error } = await updateTeacherAvailability(
          currentLesson.id,
          teacher.id,
          availability,
          currentOrganization.id
        );
        if (!error) {
          await reloadLessons();
        }
      }
    };

    const saveTeacherNote = () => {
      updateTeacherNote(localNote);
    };

    const handleNoteKeyPress = e => {
      if (e.key === 'Enter') {
        saveTeacherNote();
      }
    };

    const removeTeacher = async teacherName => {
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
                      ${
                        idx === selectedLessonIndex
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
                      setFormData({
                        time: '09:00',
                        pool: false,
                        classroom: false,
                        description: '',
                        teachers: [],
                      });
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
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pool}
                  onChange={e => setFormData({ ...formData, pool: e.target.checked })}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
                <Waves className="w-5 h-5 text-blue-600" />
                <span>Piscina</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.classroom}
                  onChange={e => setFormData({ ...formData, classroom: e.target.checked })}
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
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                rows="3"
                placeholder="Titolo lezione o note..."
              />
            </div>

            {/* Recurring lesson options - only for new lessons */}
            {isCreatingNew && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring || false}
                      onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                    <Repeat className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-800">Lezione ricorrente</span>
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-3 pl-7">
                    {/* Recurrence Label/Tag */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Corso/Tag (opzionale)
                      </label>
                      <input
                        type="text"
                        value={formData.recurrenceLabel || ''}
                        onChange={e =>
                          setFormData({ ...formData, recurrenceLabel: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="es: Corso Base Lunedì, Allenamento Avanzato..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        🏷️ Identifica facilmente questa serie di lezioni
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequenza
                        </label>
                        <select
                          value={formData.recurrenceType || 'weekly'}
                          onChange={e =>
                            setFormData({ ...formData, recurrenceType: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                          <option value="daily">Giornaliera</option>
                          <option value="weekly">Settimanale</option>
                          <option value="monthly">Mensile</option>
                          <option value="yearly">Annuale</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ogni</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={formData.recurrenceInterval || 1}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                recurrenceInterval: parseInt(e.target.value),
                              })
                            }
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                          <span className="text-sm text-gray-600">
                            {formData.recurrenceType === 'daily'
                              ? 'giorni'
                              : formData.recurrenceType === 'weekly'
                                ? 'settimane'
                                : formData.recurrenceType === 'monthly'
                                  ? 'mesi'
                                  : 'anni'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Termina il (opzionale)
                      </label>
                      <input
                        type="date"
                        value={formData.recurrenceEnd || ''}
                        onChange={e => setFormData({ ...formData, recurrenceEnd: e.target.value })}
                        min={selectedDate}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Lascia vuoto per creare fino a 52 occorrenze
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
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
        {currentUser.role === 'teacher' &&
          currentLesson &&
          (currentLesson.pool || currentLesson.classroom) && (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note personali
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localNote}
                    onChange={e => setLocalNote(e.target.value)}
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
              {/* Button to remove own availability */}
              {currentTeacher && (currentTeacher.pool || currentTeacher.classroom) && (
                <div className="pt-3 border-t border-cyan-200">
                  <button
                    onClick={() => removeTeacher(currentUser.name)}
                    className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Ritira la mia disponibilità
                  </button>
                </div>
              )}
            </div>
          )}

        {/* Teachers list */}
        {currentLesson && currentLesson.teachers && currentLesson.teachers.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Istruttori disponibili</h4>
            <div className="space-y-2">
              {currentLesson.teachers.map((teacher, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{teacher.name}</div>
                    <div className="flex gap-3 text-sm text-gray-600 mt-1">
                      {teacher.pool && (
                        <span className="flex items-center gap-1">
                          <Waves className="w-4 h-4" /> Piscina
                        </span>
                      )}
                      {teacher.classroom && (
                        <span className="flex items-center gap-1">
                          <School className="w-4 h-4" /> Aula
                        </span>
                      )}
                    </div>
                    {teacher.note && (
                      <p className="text-sm text-gray-600 mt-1 italic">{teacher.note}</p>
                    )}
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

  const handleDeleteUser = async userId => {
    const user = users.find(u => u.id === userId);
    if (
      user &&
      window.confirm(
        `Sei sicuro di voler eliminare l'istruttore "${user.name}"?\n\nQuesta azione non può essere annullata.`
      )
    ) {
      const { error } = await deleteUser(userId);
      if (!error) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Notifications Component (Admin only)
  const NotificationsPanel = () => {
    // Get recent availabilities (last 20)
    const getRecentAvailabilities = () => {
      const availabilities = [];

      Object.entries(lessons).forEach(([dateKey, dayLessons]) => {
        dayLessons.forEach(lesson => {
          if (lesson.teachers && lesson.teachers.length > 0) {
            lesson.teachers.forEach(teacher => {
              availabilities.push({
                teacher: teacher.name,
                username: users.find(u => u.name === teacher.name)?.username || teacher.name,
                date: dateKey,
                dateObj: new Date(dateKey),
                time: lesson.time,
                pool: teacher.pool,
                classroom: teacher.classroom,
                note: teacher.note,
                lessonDescription: lesson.description,
              });
            });
          }
        });
      });

      // Sort by date (most recent first) and take last 20
      return availabilities.sort((a, b) => b.dateObj - a.dateObj).slice(0, 20);
    };

    const recentAvailabilities = getRecentAvailabilities();

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-600" />
            <h3 className="text-xl font-bold text-gray-800">Ultime Disponibilità</h3>
          </div>
          <span className="text-sm text-gray-500">{recentAvailabilities.length} registrate</span>
        </div>

        {recentAvailabilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Nessuna disponibilità registrata</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAvailabilities.map((avail, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-cyan-600" />
                      <span className="font-semibold text-gray-800">@{avail.username}</span>
                      <span className="text-sm text-gray-500">({avail.teacher})</span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {new Date(avail.date).toLocaleDateString('it-IT', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      - Ore {avail.time}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {avail.pool && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          <Droplets className="w-3 h-3" />
                          Piscina
                        </span>
                      )}
                      {avail.classroom && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          <BookOpen className="w-3 h-3" />
                          Aula
                        </span>
                      )}
                    </div>

                    {avail.note && (
                      <p className="text-xs text-gray-600 mt-2 italic">\"{avail.note}\"</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Monthly Summary Component
  const MonthlySummary = () => {
    // Get available months from lessons data
    const getAvailableMonths = () => {
      const months = new Set();
      Object.keys(lessons).forEach(dateKey => {
        const date = new Date(dateKey);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        months.add(monthKey);
      });
      return Array.from(months).sort().reverse(); // Most recent first
    };

    // Filter lessons for selected month
    const getMonthLessons = () => {
      const year = selectedMonthSummary.getFullYear();
      const month = selectedMonthSummary.getMonth();

      const monthLessons = [];
      Object.entries(lessons).forEach(([dateKey, dayLessons]) => {
        const lessonDate = new Date(dateKey);
        if (lessonDate.getFullYear() === year && lessonDate.getMonth() === month) {
          dayLessons.forEach(lesson => {
            monthLessons.push({
              ...lesson,
              date: dateKey,
              dateObj: lessonDate,
            });
          });
        }
      });
      return monthLessons;
    };

    const monthLessons = getMonthLessons();
    const availableMonths = getAvailableMonths();

    // Calculate statistics
    const totalLessons = monthLessons.length;

    // Count unique active instructors (those with at least one availability)
    const activeInstructors = new Set();
    monthLessons.forEach(lesson => {
      if (lesson.teachers && lesson.teachers.length > 0) {
        lesson.teachers.forEach(teacher => {
          activeInstructors.add(teacher.name);
        });
      }
    });
    const activeInstructorsCount = activeInstructors.size;

    // Count total availabilities (each instructor availability for each lesson)
    const totalAvailabilities = monthLessons.reduce((sum, lesson) => {
      return sum + (lesson.teachers ? lesson.teachers.length : 0);
    }, 0);

    // Count lessons by type
    const theoryLessons = monthLessons.filter(lesson => lesson.classroom && !lesson.pool).length;
    const practiceLessons = monthLessons.filter(lesson => lesson.pool && !lesson.classroom).length;
    const bothLessons = monthLessons.filter(lesson => lesson.pool && lesson.classroom).length;

    const handleMonthChange = monthString => {
      const [year, month] = monthString.split('-');
      setSelectedMonthSummary(new Date(parseInt(year), parseInt(month) - 1, 1));
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Riepilogo Mensile</h3>

            {/* Month selector */}
            {availableMonths.length > 1 && (
              <div className="relative">
                <select
                  value={`${selectedMonthSummary.getFullYear()}-${(selectedMonthSummary.getMonth() + 1).toString().padStart(2, '0')}`}
                  onChange={e => handleMonthChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  {availableMonths.map(monthKey => {
                    const [year, month] = monthKey.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                    return (
                      <option key={monthKey} value={monthKey}>
                        {date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lezioni Totali</p>
                  <p className="text-3xl font-bold text-cyan-600">{totalLessons}</p>
                </div>
                <School className="w-8 h-8 text-cyan-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Istruttori Attivi</p>
                  <p className="text-3xl font-bold text-green-600">{activeInstructorsCount}</p>
                </div>
                <User className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Disponibilità</p>
                  <p className="text-3xl font-bold text-purple-600">{totalAvailabilities}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Lessons by Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Lezioni per Tipo</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Teoria:</span>
                  </div>
                  <span className="font-semibold text-gray-800">{theoryLessons + bothLessons}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Pratica:</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {practiceLessons + bothLessons}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructors Statistics */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Statistiche Istruttori</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(() => {
                  // Calculate stats per instructor
                  const instructorStats = {};
                  monthLessons.forEach(lesson => {
                    if (lesson.teachers) {
                      lesson.teachers.forEach(teacher => {
                        if (!instructorStats[teacher.name]) {
                          instructorStats[teacher.name] = {
                            name: teacher.name,
                            total: 0,
                            pool: 0,
                            classroom: 0,
                          };
                        }
                        instructorStats[teacher.name].total++;
                        if (teacher.pool) instructorStats[teacher.name].pool++;
                        if (teacher.classroom) instructorStats[teacher.name].classroom++;
                      });
                    }
                  });

                  // Convert to array and sort by total
                  const sortedInstructors = Object.values(instructorStats).sort(
                    (a, b) => b.total - a.total
                  );

                  return sortedInstructors.length > 0 ? (
                    sortedInstructors.map(instructor => (
                      <div
                        key={instructor.name}
                        className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-cyan-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {users.find(u => u.name === instructor.name)?.username ||
                              instructor.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-semibold text-gray-800">{instructor.total}</span>
                          {instructor.pool > 0 && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Droplets className="w-3 h-3" />
                              {instructor.pool}
                            </span>
                          )}
                          {instructor.classroom > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <BookOpen className="w-3 h-3" />
                              {instructor.classroom}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nessuna disponibilità registrata</p>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Instructor Balance - Who gave less availability */}
          {currentUser.role === 'admin' &&
            (() => {
              // Get all instructors
              const allInstructors = users.filter(u => u.role === 'teacher');

              // Calculate availability count and last availability date per instructor
              const instructorAvailability = {};
              allInstructors.forEach(instructor => {
                instructorAvailability[instructor.name] = {
                  count: 0,
                  lastAvailabilityDate: null,
                };
              });

              monthLessons.forEach(lesson => {
                if (lesson.teachers) {
                  lesson.teachers.forEach(teacher => {
                    if (
                      Object.prototype.hasOwnProperty.call(instructorAvailability, teacher.name)
                    ) {
                      instructorAvailability[teacher.name].count++;
                      const lessonDate = new Date(lesson.date);
                      if (
                        !instructorAvailability[teacher.name].lastAvailabilityDate ||
                        lessonDate > instructorAvailability[teacher.name].lastAvailabilityDate
                      ) {
                        instructorAvailability[teacher.name].lastAvailabilityDate = lessonDate;
                      }
                    }
                  });
                }
              });

              // Sort by availability (ascending - less availability first), then by oldest last availability
              const sortedByAvailability = Object.entries(instructorAvailability)
                .map(([name, data]) => ({
                  name,
                  username: users.find(u => u.name === name)?.username || name,
                  count: data.count,
                  lastAvailabilityDate: data.lastAvailabilityDate,
                }))
                .sort((a, b) => {
                  // First sort by count (ascending)
                  if (a.count !== b.count) return a.count - b.count;
                  // If same count, sort by last availability date (oldest first)
                  // null dates (no availability) go first
                  if (!a.lastAvailabilityDate && !b.lastAvailabilityDate) return 0;
                  if (!a.lastAvailabilityDate) return -1;
                  if (!b.lastAvailabilityDate) return 1;
                  return a.lastAvailabilityDate - b.lastAvailabilityDate;
                });

              // Determine which instructors are tied for worst (same count AND same last date)
              const firstInstructor = sortedByAvailability[0];
              const worstInstructors = sortedByAvailability.filter(
                inst =>
                  inst.count === firstInstructor.count &&
                  ((!inst.lastAvailabilityDate && !firstInstructor.lastAvailabilityDate) ||
                    inst.lastAvailabilityDate?.getTime() ===
                      firstInstructor.lastAvailabilityDate?.getTime())
              );

              // Find next tier (not in worst group)
              const nextTierInstructors = sortedByAvailability.filter(
                inst => !worstInstructors.includes(inst)
              );
              const secondTierFirst =
                nextTierInstructors.length > 0 ? nextTierInstructors[0] : null;
              const secondTierInstructors = secondTierFirst
                ? nextTierInstructors.filter(
                    inst =>
                      inst.count === secondTierFirst.count &&
                      ((!inst.lastAvailabilityDate && !secondTierFirst.lastAvailabilityDate) ||
                        inst.lastAvailabilityDate?.getTime() ===
                          secondTierFirst.lastAvailabilityDate?.getTime())
                  )
                : [];

              return (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                    Bilanciamento Carichi di Lavoro
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Istruttori ordinati per numero di disponibilità date (dal più basso al più
                    alto). A parità, chi ha la disponibilità più vecchia:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedByAvailability.map((instructor, index) => {
                      const isWorst = worstInstructors.includes(instructor);
                      const isSecondTier = secondTierInstructors.includes(instructor);

                      return (
                        <div
                          key={instructor.name}
                          className={`p-4 rounded-lg border-2 ${
                            isWorst
                              ? 'border-red-300 bg-red-50'
                              : isSecondTier
                                ? 'border-orange-300 bg-orange-50'
                                : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-cyan-600" />
                              <span className="font-medium text-gray-800">
                                {instructor.username}
                              </span>
                            </div>
                            <span
                              className={`text-lg font-bold ${
                                isWorst
                                  ? 'text-red-600'
                                  : isSecondTier
                                    ? 'text-orange-600'
                                    : 'text-gray-600'
                              }`}
                            >
                              {instructor.count}
                            </span>
                          </div>
                          {isWorst && instructor.count === 0 && (
                            <p className="text-xs text-red-600 mt-2">Nessuna disponibilità data!</p>
                          )}
                          {isWorst && instructor.count > 0 && (
                            <p className="text-xs text-red-600 mt-2">Ha dato meno disponibilità</p>
                          )}
                          {instructor.lastAvailabilityDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ultima:{' '}
                              {instructor.lastAvailabilityDate.toLocaleDateString('it-IT', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          {/* Uncovered Lessons Table */}
          {currentUser.role === 'admin' &&
            (() => {
              const uncoveredLessons = monthLessons.filter(
                lesson => !lesson.teachers || lesson.teachers.length === 0
              );

              if (uncoveredLessons.length === 0) return null;

              return (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Lezioni Senza Istruttore
                    </h4>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                      {uncoveredLessons.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Orario
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Descrizione
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {uncoveredLessons.map((lesson, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {new Date(lesson.date).toLocaleDateString('it-IT', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                              {lesson.time}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {lesson.pool && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                    <Droplets className="w-3 h-3" />
                                    Piscina
                                  </span>
                                )}
                                {lesson.classroom && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    <BookOpen className="w-3 h-3" />
                                    Aula
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {lesson.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    );
  };

  // Lessons Summary Component
  const LessonsSummary = () => {
    // Get available months from lessons data
    const getAvailableMonths = () => {
      const months = new Set();
      Object.keys(lessons).forEach(dateKey => {
        const date = new Date(dateKey);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        months.add(monthKey);
      });
      return Array.from(months).sort().reverse(); // Most recent first
    };

    // Get lessons for selected month
    const getMonthLessons = () => {
      const year = selectedMonthLessons.getFullYear();
      const month = selectedMonthLessons.getMonth();

      const monthLessons = [];
      Object.entries(lessons).forEach(([dateKey, dayLessons]) => {
        const lessonDate = new Date(dateKey);
        if (lessonDate.getFullYear() === year && lessonDate.getMonth() === month) {
          dayLessons.forEach(lesson => {
            monthLessons.push({
              ...lesson,
              date: dateKey,
              dateObj: lessonDate,
            });
          });
        }
      });
      // Sort by date
      return monthLessons.sort((a, b) => a.dateObj - b.dateObj);
    };

    const monthLessons = getMonthLessons();
    const availableMonths = getAvailableMonths();

    const handleMonthChange = monthString => {
      const [year, month] = monthString.split('-');
      setSelectedMonthLessons(new Date(parseInt(year), parseInt(month) - 1, 1));
    };

    const handleEditLesson = lesson => {
      setSelectedDate(lesson.date);
    };

    const handleDeleteLesson = async lessonId => {
      if (window.confirm('Sei sicuro di voler eliminare questa lezione?')) {
        const { error } = await deleteLesson(lessonId);
        if (!error) {
          await reloadLessons();
        } else {
          console.error('Error deleting lesson:', error);
        }
      }
    };

    const handleDeleteRecurring = async recurrenceId => {
      // Count how many lessons will be deleted
      const recurringLessons = [];
      let recurrenceLabel = null;
      Object.entries(lessons).forEach(([dateKey, dayLessons]) => {
        dayLessons.forEach(lesson => {
          if (lesson.recurrence_id === recurrenceId) {
            recurringLessons.push(lesson);
            if (!recurrenceLabel && lesson.recurrence_label) {
              recurrenceLabel = lesson.recurrence_label;
            }
          }
        });
      });

      const labelText = recurrenceLabel ? `"${recurrenceLabel}"` : 'questa serie';
      if (
        window.confirm(
          `Sei sicuro di voler eliminare tutte le ${recurringLessons.length} lezioni ricorrenti di ${labelText}?`
        )
      ) {
        // Delete all lessons with same recurrence_id
        for (const lesson of recurringLessons) {
          await deleteLesson(lesson.id);
        }
        await reloadLessons();
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Lezioni Programmate</h3>

          {/* Month selector */}
          {availableMonths.length > 1 && (
            <div className="relative">
              <select
                value={`${selectedMonthLessons.getFullYear()}-${(selectedMonthLessons.getMonth() + 1).toString().padStart(2, '0')}`}
                onChange={e => handleMonthChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {availableMonths.map(monthKey => {
                  const [year, month] = monthKey.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                  return (
                    <option key={monthKey} value={monthKey}>
                      {date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>

        {monthLessons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <School className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Nessuna lezione programmata</p>
            <p className="text-sm">Seleziona una data dal calendario per aggiungere una lezione</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthLessons.map((lesson, index) => {
              const isUncovered = !lesson.teachers || lesson.teachers.length === 0;
              return (
                <div
                  key={`${lesson.date}-${lesson.id}-${index}`}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${isUncovered ? 'border-red-500 border-2 bg-red-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {lesson.description ||
                            `Lezione ${lesson.pool ? 'Piscina' : ''} ${lesson.classroom ? 'Aula' : ''}`.trim()}
                        </h4>
                        <div className="flex gap-2">
                          {isUncovered && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-semibold">
                              ⚠️ Scoperta
                            </div>
                          )}
                          {lesson.recurrence_id && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              <Repeat className="w-3 h-3" />
                              <span>{lesson.recurrence_label || 'Ricorrente'}</span>
                            </div>
                          )}
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
                        {lesson.pool && lesson.classroom
                          ? 'Corso base apnea - teoria e pratica'
                          : lesson.pool
                            ? 'Allenamento piscina'
                            : lesson.classroom
                              ? 'Lezione teorica'
                              : 'Lezione generica'}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {new Date(lesson.date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
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
                      {lesson.recurrence_id && currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteRecurring(lesson.recurrence_id)}
                          className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors border border-purple-200 flex items-center gap-1"
                          title="Elimina tutte le lezioni ricorrenti"
                        >
                          <Repeat className="w-3 h-3" />
                          Elimina serie
                        </button>
                      )}
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200"
                        >
                          Elimina
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Statistics Component (Admin only)
  const Statistics = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('total');

    // Get available months from lessons data
    const getAvailableMonths = () => {
      const months = new Set();
      Object.keys(lessons).forEach(dateKey => {
        const date = new Date(dateKey);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        months.add(monthKey);
      });
      return Array.from(months).sort().reverse();
    };

    // Filter lessons based on selected period
    const getFilteredLessons = () => {
      if (selectedPeriod === 'total') {
        // Return all lessons
        const allLessons = [];
        Object.entries(lessons).forEach(([dateKey, dayLessons]) => {
          dayLessons.forEach(lesson => {
            allLessons.push({ ...lesson, date: dateKey });
          });
        });
        return allLessons;
      } else {
        // Filter by month
        const [year, month] = selectedPeriod.split('-');
        const filtered = [];
        Object.entries(lessons).forEach(([dateKey, dayLessons]) => {
          const lessonDate = new Date(dateKey);
          if (
            lessonDate.getFullYear() === parseInt(year) &&
            lessonDate.getMonth() === parseInt(month) - 1
          ) {
            dayLessons.forEach(lesson => {
              filtered.push({ ...lesson, date: dateKey });
            });
          }
        });
        return filtered;
      }
    };

    const filteredLessons = getFilteredLessons();
    const availableMonths = getAvailableMonths();

    // Calculate statistics
    const totalLessons = filteredLessons.length;

    // Calculate availability by instructor
    const instructorAvailability = {};
    filteredLessons.forEach(lesson => {
      if (lesson.teachers && lesson.teachers.length > 0) {
        lesson.teachers.forEach(teacher => {
          const teacherName = teacher.name;
          if (!instructorAvailability[teacherName]) {
            instructorAvailability[teacherName] = 0;
          }
          instructorAvailability[teacherName]++;
        });
      }
    });

    // Calculate lessons by type
    const theoryLessons = filteredLessons.filter(lesson => lesson.classroom && !lesson.pool).length;
    const practiceLessons = filteredLessons.filter(
      lesson => lesson.pool && !lesson.classroom
    ).length;
    const bothLessons = filteredLessons.filter(lesson => lesson.pool && lesson.classroom).length;

    // Calculate coverage
    const coveredLessons = filteredLessons.filter(
      lesson => lesson.teachers && lesson.teachers.length > 0
    ).length;
    const uncoveredLessons = filteredLessons.filter(
      lesson => !lesson.teachers || lesson.teachers.length === 0
    ).length;

    // PieChart component
    const PieChart = ({ data, colors, size = 200 }) => {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      if (total === 0) return null;

      // Check if there's only one category with 100%
      const nonZeroData = data.filter(item => item.value > 0);
      if (nonZeroData.length === 1) {
        // Show a full circle with a white border and centered text
        const radius = size / 2 - 10;
        const centerX = size / 2;
        const centerY = size / 2;

        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill={nonZeroData[0].color}
              stroke="white"
              strokeWidth="3"
            />
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="32"
              fontWeight="bold"
            >
              100%
            </text>
          </svg>
        );
      }

      let currentAngle = -90; // Start from top

      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, index) => {
            if (item.value === 0) return null;

            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            // Convert angles to radians
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const radius = size / 2 - 10;
            const centerX = size / 2;
            const centerY = size / 2;

            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z',
            ].join(' ');

            currentAngle = endAngle;

            return (
              <g key={index}>
                <path d={pathData} fill={colors[index]} stroke="white" strokeWidth="2" />
                {percentage > 5 && (
                  <text
                    x={centerX + radius * 0.6 * Math.cos((startRad + endRad) / 2)}
                    y={centerY + radius * 0.6 * Math.sin((startRad + endRad) / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {percentage.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      );
    };

    // Generate colors for instructors (different shades)
    const instructorColors = [
      '#10b981', // green
      '#06b6d4', // cyan
      '#8b5cf6', // purple
      '#f59e0b', // amber
      '#ef4444', // red
      '#ec4899', // pink
      '#6366f1', // indigo
      '#14b8a6', // teal
    ];

    const availabilityData = Object.entries(instructorAvailability).map(([name, count], index) => ({
      label: name,
      value: count,
      color: instructorColors[index % instructorColors.length],
    }));

    const lessonTypeData = [
      { label: 'Solo Aula', value: theoryLessons, color: '#10b981' },
      { label: 'Solo Piscina', value: practiceLessons, color: '#06b6d4' },
      { label: 'Entrambi', value: bothLessons, color: '#8b5cf6' },
    ];

    const coverageData = [
      { label: 'Coperte', value: coveredLessons, color: '#10b981' },
      { label: 'Non Coperte', value: uncoveredLessons, color: '#ef4444' },
    ];

    const totalAvailabilities = Object.values(instructorAvailability).reduce(
      (sum, count) => sum + count,
      0
    );

    return (
      <div className="space-y-6">
        {/* Period selector */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Statistiche</h3>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="total">TOTALE</option>
                {availableMonths.map(monthKey => {
                  const [year, month] = monthKey.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                  return (
                    <option key={monthKey} value={monthKey}>
                      {date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Availability Chart */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Disponibilità per Istruttore
              </h4>
              {availabilityData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Nessuna disponibilità inserita</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <PieChart
                    data={availabilityData}
                    colors={availabilityData.map(d => d.color)}
                    size={220}
                  />
                  <div className="mt-6 space-y-2 w-full">
                    {availabilityData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </div>
                        <span className="font-semibold text-gray-800">{item.value} lezioni</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          Totale disponibilità
                        </span>
                        <span className="font-bold text-gray-800">{totalAvailabilities}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Type Chart */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Tipologia Lezioni
              </h4>
              {totalLessons === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Nessun dato disponibile</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <PieChart
                    data={lessonTypeData}
                    colors={['#10b981', '#06b6d4', '#8b5cf6']}
                    size={220}
                  />
                  <div className="mt-6 space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700">Solo Aula (Teoria)</span>
                      </div>
                      <span className="font-semibold text-gray-800">{theoryLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                        <span className="text-sm text-gray-700">Solo Piscina (Pratica)</span>
                      </div>
                      <span className="font-semibold text-gray-800">{practiceLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                        <span className="text-sm text-gray-700">Entrambi</span>
                      </div>
                      <span className="font-semibold text-gray-800">{bothLessons}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Totale lezioni</span>
                        <span className="font-bold text-gray-800">{totalLessons}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coverage Chart */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Copertura Lezioni
              </h4>
              {totalLessons === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Nessun dato disponibile</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <PieChart data={coverageData} colors={['#10b981', '#ef4444']} size={220} />
                  <div className="mt-6 space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700">Coperte (con istruttore)</span>
                      </div>
                      <span className="font-semibold text-gray-800">{coveredLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-700">
                          Non Coperte (senza istruttore)
                        </span>
                      </div>
                      <span className="font-semibold text-gray-800">{uncoveredLessons}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Totale lezioni</span>
                        <span className="font-bold text-gray-800">{totalLessons}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-gray-700">
                          Percentuale copertura
                        </span>
                        <span className="font-bold text-gray-800">
                          {totalLessons > 0
                            ? ((coveredLessons / totalLessons) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // User manager (admin only)
  const UserManager = () => {
    // Local state for user editing to avoid losing focus
    const [editingData, setEditingData] = useState({});
    // Local state for new user creation to avoid losing focus
    const [localNewUser, setLocalNewUser] = useState({ username: '', name: '', password: '' });
    // Local state to track which passwords are visible
    const [visiblePasswords, setVisiblePasswords] = useState({});

    // Populate editingData when editingUser changes
    useEffect(() => {
      if (editingUser) {
        const user = users.find(u => u.id === editingUser);
        if (user) {
          setEditingData({
            username: user.username || '',
            name: user.name || '',
            password: user.password || 'teacher123',
          });
        }
      } else {
        setEditingData({});
      }
    }, [editingUser, users]);

    const togglePasswordVisibility = userId => {
      setVisiblePasswords(prev => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    };

    const handleUpdateUser = async (userId, updates) => {
      const { data, error } = await updateUser(userId, updates);
      if (!error && data) {
        setUsers(users.map(u => (u.id === userId ? data : u)));
        setEditingUser(null);
        setEditingData({});
      } else {
        console.error('Error updating user:', error);
      }
    };

    const startEditing = user => {
      console.log('Starting edit for user:', user);
      setEditingUser(user.id);
      // editingData will be populated by useEffect
    };

    const saveUserChanges = userId => {
      const updates = {
        username: editingData.username,
        name: editingData.name,
        password: editingData.password,
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
              onChange={e => setLocalNewUser({ ...localNewUser, username: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Nome completo"
              value={localNewUser.name}
              onChange={e => setLocalNewUser({ ...localNewUser, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={localNewUser.password}
              onChange={e => setLocalNewUser({ ...localNewUser, password: e.target.value })}
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
                {users
                  .filter(u => u.role === 'teacher')
                  .map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      {editingUser === user.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editingData.name || ''}
                              onChange={e =>
                                setEditingData({ ...editingData, name: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              placeholder="Nome completo"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editingData.username || ''}
                              onChange={e =>
                                setEditingData({ ...editingData, username: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              placeholder="Username"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="password"
                              value={editingData.password || ''}
                              onChange={e =>
                                setEditingData({ ...editingData, password: e.target.value })
                              }
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
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-gray-600 font-mono">
                                {visiblePasswords[user.id] ? user.password || 'N/A' : '••••••••'}
                              </div>
                              <button
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                title={
                                  visiblePasswords[user.id]
                                    ? 'Nascondi password'
                                    : 'Mostra password'
                                }
                              >
                                {visiblePasswords[user.id] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
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
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }, []);

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

            {/* Current Date and Time */}
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {currentTime.toLocaleDateString('it-IT', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="text-xl font-semibold text-gray-700">
                {currentTime.toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium text-gray-800">{currentUser.name}</div>
                <div className="text-sm text-gray-600">
                  {currentUser.role === 'admin' ? 'Admin' : 'Istruttore'}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowUserManager(false);
                    setShowSummary(false);
                    setShowStatistics(false);
                    setShowNotifications(false);
                  }}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm
                    ${
                      !showUserManager && !showSummary && !showStatistics && !showNotifications
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-cyan-600 hover:bg-cyan-50 border border-cyan-200'
                    }
                  `}
                  title="Visualizza calendario"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="hidden sm:inline">Calendario</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserManager(false);
                    setShowSummary(true);
                    setShowStatistics(false);
                    setShowNotifications(false);
                  }}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm
                    ${
                      showSummary
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-cyan-600 hover:bg-cyan-50 border border-cyan-200'
                    }
                  `}
                  title="Visualizza riepilogo mensile"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="hidden sm:inline">Riepilogo</span>
                </button>

                {currentUser.role === 'admin' && (
                  <>
                    <button
                      onClick={() => {
                        setShowUserManager(false);
                        setShowSummary(false);
                        setShowStatistics(true);
                        setShowNotifications(false);
                      }}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm
                        ${
                          showStatistics
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-cyan-600 hover:bg-cyan-50 border border-cyan-200'
                        }
                      `}
                      title="Visualizza statistiche"
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span className="hidden sm:inline">Statistiche</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserManager(true);
                        setShowSummary(false);
                        setShowStatistics(false);
                        setShowNotifications(false);
                      }}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm
                        ${
                          showUserManager
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-cyan-600 hover:bg-cyan-50 border border-cyan-200'
                        }
                      `}
                      title="Gestisci istruttori"
                    >
                      <Users className="w-5 h-5" />
                      <span className="hidden sm:inline">Istruttori</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowNotifications(true);
                        setShowUserManager(false);
                        setShowSummary(false);
                        setShowStatistics(false);
                        setSelectedDate(null);
                      }}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm relative
                        ${
                          showNotifications
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-cyan-600 hover:bg-cyan-50 border border-cyan-200'
                        }
                      `}
                      title="Notifiche disponibilità"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="hidden sm:inline">Notifiche</span>
                    </button>
                  </>
                )}
              </div>

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
          ) : showNotifications && currentUser.role === 'admin' ? (
            <NotificationsPanel />
          ) : showStatistics && currentUser.role === 'admin' ? (
            <Statistics />
          ) : showSummary ? (
            <MonthlySummary />
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
