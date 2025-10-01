import { supabase } from './supabase.js'

// Get all available organizations
export const getOrganizations = async () => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name')

  return { data, error }
}

// Get organization by slug
export const getOrganizationBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()

  return { data, error }
}

// Create a new organization (for future expansion)
export const createOrganization = async (organizationData) => {
  const { data, error } = await supabase
    .from('organizations')
    .insert([organizationData])
    .select()
    .single()

  return { data, error }
}