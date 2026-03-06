import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ljmnzfkszzfaxslqivhl.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbW56ZmtzenpmYXhzbHFpdmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDcwNTgsImV4cCI6MjA4NjE4MzA1OH0.zuvBBO_AsDy971FEzznNJOU4H3giK8Po2cV5IHb1mRg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)