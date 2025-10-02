import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rltvqpkbjgoricpusdfj.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdHZxcGtiamdvcmljcHVzZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjEwNDYsImV4cCI6MjA3NDg5NzA0Nn0.kzt7rhp3uIcCsVFjPwQqYlEvhVFkE43cWIHAEiR1aeE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
