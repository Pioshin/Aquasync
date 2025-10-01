import { supabase } from './supabase.js'

// Auth functions
export const signIn = async (username, password) => {
  try {
    // First, find user by username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (userError || !userData) {
      throw new Error('Username not found')
    }

    // For demo purposes, we'll use a simple password check
    // In production, you should use proper Supabase auth
    const demoPassword = userData.role === 'admin' ? 'admin123' : 'teacher123'

    if (password !== demoPassword) {
      throw new Error('Invalid password')
    }

    return { user: userData, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const signOut = async () => {
  // For demo, just return success
  return { error: null }
}

// User management functions
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')

  return { data, error }
}

export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      username: userData.username,
      name: userData.name,
      role: 'teacher'
    }])
    .select()
    .single()

  return { data, error }
}

export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

export const deleteUser = async (userId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  return { error }
}