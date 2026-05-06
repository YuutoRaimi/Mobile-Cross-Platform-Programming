import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kwlkshjktlgvudpwjhlw.supabase.co";
const supabaseAnonKey = "sb_publishable_n2qe20p2BE0uctTgpLhILg_HK5dlaMz";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
