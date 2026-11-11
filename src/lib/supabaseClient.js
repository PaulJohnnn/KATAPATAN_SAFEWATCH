import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase is optional. Without these two build-time variables the app keeps
// its data in the browser (see store.js) and never calls the network.
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = hasSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null
