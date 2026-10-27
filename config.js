// RAW live configuration. Fill these two values from Supabase (Project Settings > API).
// Leave them empty and RAW runs in preview mode (profiles saved on the device only).
window.RAW_CONFIG = {
  supabaseUrl: "https://ufcndqvtpbulfgidzqxb.supabase.co",        // e.g. https://abcdefgh.supabase.co
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmY25kcXZ0cGJ1bGZnaWR6cXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODcyNDgsImV4cCI6MjEwODY2MzI0OH0.Ex_FKdKU0g9CzG0C92qBfW1y35N2yC3NjJMWC_UR7WE",    // the long "anon public" key
  aiEndpoint: "/api/compose" // AI composer: needs GEMINI_API_KEY (and optionally GROQ_API_KEY) set in Vercel
};
