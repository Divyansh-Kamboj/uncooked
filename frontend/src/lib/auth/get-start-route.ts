import { getCurrentUser } from "@/lib/supabase/server";

export async function getStartRoute() {
  const user = await getCurrentUser();
  return user ? "/practice" : "/login";
}
