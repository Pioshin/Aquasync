import { supabase } from './supabase.js';

// Auth functions
export const signIn = async (username, password, organizationSlug = null) => {
  try {
    // Build query to find user by username
    let query = supabase
      .from('users')
      .select(
        `
        *,
        organizations!inner (
          id,
          name,
          slug
        )
      `
      )
      .eq('username', username);

    // If organization is specified, filter by it
    if (organizationSlug) {
      query = query.eq('organizations.slug', organizationSlug);
    }

    const { data: userData, error: userError } = await query.single();

    if (userError || !userData) {
      // Check if user exists in any organization for better error message
      const { data: anyUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (anyUser && organizationSlug) {
        throw new Error(`Username not found in ${organizationSlug.toUpperCase()} environment`);
      }
      throw new Error('Invalid username or password');
    }

    // Check password from database
    if (password !== userData.password) {
      throw new Error('Invalid username or password');
    }

    // Add organization info to user object
    const userWithOrg = {
      ...userData,
      organization: userData.organizations,
    };
    delete userWithOrg.organizations;

    return { user: userWithOrg, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signOut = async () => {
  // For demo, just return success
  return { error: null };
};

// User management functions
export const getUsers = async organizationId => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    return { data, error };
  } catch (error) {
    // Fallback: if organization_id column doesn't exist yet, get all users
    console.warn('Falling back to getting all users:', error);
    const { data, error: fallbackError } = await supabase.from('users').select('*').order('name');

    return { data, error: fallbackError };
  }
};

export const createUser = async (userData, organizationId) => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        username: userData.username,
        name: userData.name,
        password: userData.password || 'teacher123',
        role: 'teacher',
        organization_id: organizationId,
      },
    ])
    .select()
    .single();

  return { data, error };
};

export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

export const deleteUser = async userId => {
  const { error } = await supabase.from('users').delete().eq('id', userId);

  return { error };
};
