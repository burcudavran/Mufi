import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qdkufxohwnxscmekujhc.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFka3VmeG9od254c2NtZWt1amhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDkxODIsImV4cCI6MjA5NDUyNTE4Mn0.kklDZdxhdCHjMGGZxze_rCUdcOWTncb94hBlP3vksGw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
