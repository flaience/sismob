import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = "https://ldmyywjrqyqoafwxspin.supabase.co";
// ATENÇÃO: Use aqui a sua 'Anon Key' (a pública), não a 'Service Role'
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbXl5d2pycXlxb2Fmd3hzcGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTA5MTgsImV4cCI6MjA4ODcyNjkxOH0.bYdCTEcROZb9dr3Z0gQgw09vp-YZ2SaRarivnoF2cJQ";

// Exportamos a instância pronta (Singleton)
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
