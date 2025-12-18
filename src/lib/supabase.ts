import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eydyioxqgbldlydaexfa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZHlpb3hxZ2JsZGx5ZGFleGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNTk3OTcsImV4cCI6MjA3MzczNTc5N30.PqqfvD2EA8W8SGv2EgViXEnn3ZGZeZmhX8LXeQqB01A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
