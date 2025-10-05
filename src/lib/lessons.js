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
        recurrence_id: lessonData.recurrence_id || null,
        recurrence_label: lessonData.recurrence_label || null,
      },
    ])
    .select()
    .single();
  if (error) {
    console.error('createLesson failed:', {
      error,
      payload: {
        date: dateKey,
        time: lessonData.time,
        pool: lessonData.pool,
        classroom: lessonData.classroom,
        description: lessonData.description,
        created_by: lessonData.created_by,
        organization_id: organizationId,
        recurrence_id: lessonData.recurrence_id || null,
        recurrence_label: lessonData.recurrence_label || null,
      },
    });
  }
  return { data, error };
};

export const updateLesson = async (lessonId, updates) => {
  // Create a clean object with only the fields that can be updated.
  const lessonData = {
    time: updates.time,
    pool: updates.pool,
    classroom: updates.classroom,
    description: updates.description,
  };

  // Filter out undefined values so they are not sent to Supabase,
  // which could unintentionally nullify existing values.
  Object.keys(lessonData).forEach(key => {
    if (lessonData[key] === undefined) {
      delete lessonData[key];
    }
  });

  // If there are no valid fields to update, we can avoid a DB call.
  if (Object.keys(lessonData).length === 0) {
    console.warn('updateLesson called with no valid fields to update.');
    return { data: null, error: null }; // Not an error, just nothing to do.
  }

  const { data, error } = await supabase
    .from('lessons')
    .update(lessonData) // Pass the sanitized object
    .eq('id', lessonId)
    .select()
    .single();
  if (error) {
    console.error('updateLesson failed:', { error, lessonId, updates: lessonData });
  }

  return { data, error };
};

export const deleteLesson = async lessonId => {
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);

  return { error };
};

// Bulk update all lessons in a series from a given date (inclusive)
export const updateSeriesFromDate = async (
  recurrenceId,
  fromDate, // 'YYYY-MM-DD'
  updates,
  organizationId
) => {
  // Only allow updating the editable fields, same policy as updateLesson
  const allowed = {
    time: updates.time,
    pool: updates.pool,
    classroom: updates.classroom,
    description: updates.description,
  };
  Object.keys(allowed).forEach(key => {
    if (allowed[key] === undefined) delete allowed[key];
  });

  if (Object.keys(allowed).length === 0) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('lessons')
    .update(allowed)
    .eq('recurrence_id', recurrenceId)
    .gte('date', fromDate)
    .eq('organization_id', organizationId)
    .select();
  if (error) {
    console.error('updateSeriesFromDate failed:', {
      error,
      recurrenceId,
      fromDate,
      updates: allowed,
      organizationId,
    });
  }

  return { data, error };
};

// Teacher availability functions
export const updateTeacherAvailability = async (
  lessonId,
  teacherId,
  availability,
  organizationId
) => {
  // Lookup existing availability rows for this lesson+teacher.
  // Avoid .single() which can 406 when duplicates exist.
  const { data: rows, error: selectError } = await supabase
    .from('teacher_availability')
    .select('id')
    .eq('lesson_id', lessonId)
    .eq('teacher_id', teacherId);

  if (selectError) {
    console.error('select teacher_availability failed:', {
      selectError,
      lessonId,
      teacherId,
    });
    return { data: null, error: selectError };
  }

  if (rows && rows.length > 0) {
    // Update the first row, and optionally clean duplicates
    const targetId = rows[0].id;
    const { data, error } = await supabase
      .from('teacher_availability')
      .update({
        pool: availability.pool,
        classroom: availability.classroom,
        note: availability.note,
      })
      .eq('id', targetId)
      .select()
      .single();

    if (error) {
      console.error('update teacher_availability failed:', { error, targetId });
    }

    // If duplicates exist, remove extras to keep data consistent
    if (rows.length > 1) {
      const duplicateIds = rows.slice(1).map(r => r.id);
      const { error: cleanupError } = await supabase
        .from('teacher_availability')
        .delete()
        .in('id', duplicateIds);
      if (cleanupError) {
        console.warn('Failed to cleanup duplicate teacher_availability rows:', {
          cleanupError,
          duplicateIds,
        });
      }
    }

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

    if (error) {
      console.error('insert teacher_availability failed:', {
        error,
        lessonId,
        teacherId,
        availability,
        organizationId,
      });
    }

    return { data, error };
  }
};

export const removeTeacherAvailability = async (lessonId, teacherId) => {
  // Delete all availability records for this teacher in this lesson (also cleans duplicates)
  const { error } = await supabase
    .from('teacher_availability')
    .delete()
    .eq('lesson_id', lessonId)
    .eq('teacher_id', teacherId);

  if (error) {
    console.error('removeTeacherAvailability failed:', { error, lessonId, teacherId });
  }

  return { error };
};
