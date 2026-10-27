// RAW live configuration. Fill these two values from Supabase (Project Settings > API).
// Leave them empty and RAW runs in preview mode (profiles saved on the device only).
window.RAW_CONFIG = {
  supabaseUrl: "",        // e.g. https://abcdefgh.supabase.co
  supabaseAnonKey: "",    // the long "anon public" key
  aiEndpoint: "/api/compose" // AI composer: needs GEMINI_API_KEY (and optionally GROQ_API_KEY) set in Vercel
};
