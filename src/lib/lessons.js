import { supabase } from './supabase.js';

// Lesson management functions
export const getLessons = async organizationId => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(
        `
        *,
        teacher_availability (
          id,
          teacher_id,
          pool,
          classroom,
          note,
          users!teacher_availability_teacher_id_fkey (
            id,
            name,
            username
          )
        )
      `
      )
      .eq('organization_id', organizationId)
      .order('date')
      .order('time');

    if (error) {
      console.error('Error fetching lessons:', error);
      return { data: null, error };
    }

    // Transform data to support multiple lessons per day
    const lessonsObj = {};

    data.forEach(lesson => {
      const dateKey = lesson.date;
      const teachers = lesson.teacher_availability.map(ta => ({
        name: ta.users.name,
        pool: ta.pool,
        classroom: ta.classroom,
        note: ta.note || '',
      }));

      const lessonData = {
        id: lesson.id,
        time: lesson.time,
        pool: lesson.pool,
        classroom: lesson.classroom,
        description: lesson.description || '',
        teachers: teachers,
        recurrence_id: lesson.recurrence_id || null,
        recurrence_label: lesson.recurrence_label || null,
      };

      // Initialize array if doesn't exist
      if (!lessonsObj[dateKey]) {
        lessonsObj[dateKey] = [];
      }

      // Add lesson to the day's array
      lessonsObj[dateKey].push(lessonData);
    });

    return { data: lessonsObj, error: null };
  } catch (error) {
    // Fallback: if organization_id column doesn't exist yet, get all lessons
    console.warn('Falling back to getting all lessons:', error);
    const { data, error: fallbackError } = await supabase
      .from('lessons')
      .select(
        `
        *,
        teacher_availability (
          id,
          teacher_id,
          pool,
          classroom,
          note,
          users!teacher_availability_teacher_id_fkey (
            id,
            name,
            username
          )
        )
      `
      )
      .order('date')
      .order('time');

    if (fallbackError) {
      console.error('Error fetching lessons:', fallbackError);
      return { data: {}, error: fallbackError };
    }

    // Transform data to support multiple lessons per day
    const lessonsObj = {};

    data.forEach(lesson => {
      const dateKey = lesson.date;
      const teachers = lesson.teacher_availability.map(ta => ({
        name: ta.users.name,
        pool: ta.pool,
        classroom: ta.classroom,
        note: ta.note || '',
      }));

      const lessonData = {
        id: lesson.id,
        time: lesson.time,
        pool: lesson.pool,
        classroom: lesson.classroom,
        description: lesson.description || '',
        teachers: teachers,
        recurrence_id: lesson.recurrence_id || null,
        recurrence_label: lesson.recurrence_label || null,
      };

      // Initialize array if doesn't exist
      if (!lessonsObj[dateKey]) {
        lessonsObj[dateKey] = [];
      }

      // Add lesson to the day's array
      lessonsObj[dateKey].push(lessonData);
    });

    return { data: lessonsObj, error: null };
  }
};

export const createLesson = async (lessonData, dateKey, organizationId) => {
  const { data, error } = await supabase
    .from('lessons')
    .insert([
      {
        date: dateKey,
        time: lessonData.time,
        pool: lessonData.pool,
        classroom: lessonData.classroom,
        description: lessonData.description,
        created_by: lessonData.created_by,
        organization_id: organizationId,
      },
    ])
    .select()
    .single();

  return { data, error };
};

export const updateLesson = async (lessonId, updates) => {
  const { data, error } = await supabase
    .from('lessons')
    .update({
      time: updates.time,
      pool: updates.pool,
      classroom: updates.classroom,
      description: updates.description,
    })
    .eq('id', lessonId)
    .select()
    .single();

  return { data, error };
};

export const deleteLesson = async lessonId => {
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);

  return { error };
};

// Teacher availability functions
export const updateTeacherAvailability = async (
  lessonId,
  teacherId,
  availability,
  organizationId
) => {
  // First try to update existing availability
  const { data: existingData } = await supabase
    .from('teacher_availability')
    .select('id')
    .eq('lesson_id', lessonId)
    .eq('teacher_id', teacherId)
    .single();

  if (existingData) {
    // Update existing
    const { data, error } = await supabase
      .from('teacher_availability')
      .update({
        pool: availability.pool,
        classroom: availability.classroom,
        note: availability.note,
      })
      .eq('id', existingData.id)
      .select()
      .single();

    return { data, error };
  } else {
    // Create new
    const { data, error } = await supabase
      .from('teacher_availability')
      .insert([
        {
          lesson_id: lessonId,
          teacher_id: teacherId,
          pool: availability.pool,
          classroom: availability.classroom,
          note: availability.note,
          organization_id: organizationId,
        },
      ])
      .select()
      .single();

    return { data, error };
  }
};

export const removeTeacherAvailability = async (lessonId, teacherName) => {
  const { data: lesson, error: fetchError } = await supabase
    .from('lessons')
    .select(
      `
      teacher_availability (
        id,
        users (name)
      )
    `
    )
    .eq('id', lessonId)
    .single();

  if (fetchError || !lesson) {
    return { error: fetchError };
  }

  // Find the availability record for this teacher
  const availability = lesson.teacher_availability.find(ta => ta.users.name === teacherName);

  if (!availability) {
    return { error: 'Teacher availability not found' };
  }

  // Delete the availability record
  const { error } = await supabase.from('teacher_availability').delete().eq('id', availability.id);

  return { error };
};
