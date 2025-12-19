import { createClient } from "@supabase/supabase-js";

const getValidUrl = (url: string | undefined): string => {
  if (!url || url.includes("your_supabase_url_here") || !url.startsWith("http")) {
    return "https://placeholder.supabase.co";
  }
  return url;
};

const supabaseUrl = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
