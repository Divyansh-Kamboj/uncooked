import { createClient } from "@/lib/supabase/client";

export interface Question {
  id: number;
  question_number: string | null;
  paper_code: string | null;
  paper_year: string | null;
  session: string | null;
  component: string | null;
  topic: string | null;
  question_img: string | null;   // JSON array string
  answer_img: string | null;     // JSON array string or null
  ai_explanation: string | null;
  difficulty: string | null;
  created_at: string | null;
}

export interface QuestionFilters {
  component: string;
  topic?: string;
  difficulty?: string;
  year?: string;
  session?: string;
}

/**
 * Fetch questions matching filters (client-side, uses anon key).
 */
export async function getQuestions(filters: QuestionFilters): Promise<Question[]> {
  const supabase = createClient();
  let query = supabase
    .from("alevel_math_questions")
    .select("*")
    .eq("component", filters.component);

  if (filters.topic) query = query.eq("topic", filters.topic);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
  if (filters.year) query = query.eq("paper_year", filters.year);
  if (filters.session) query = query.eq("session", filters.session);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Question[];
}

/**
 * Get the count of questions matching filters.
 */
export async function getQuestionCount(filters: QuestionFilters): Promise<number> {
  const supabase = createClient();
  let query = supabase
    .from("alevel_math_questions")
    .select("id", { count: "exact", head: true })
    .eq("component", filters.component);

  if (filters.topic) query = query.eq("topic", filters.topic);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
  if (filters.year) query = query.eq("paper_year", filters.year);
  if (filters.session) query = query.eq("session", filters.session);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/**
 * Get distinct topics for a component.
 */
export async function getTopics(component: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("alevel_math_questions")
    .select("topic")
    .eq("component", component)
    .not("topic", "is", null);

  if (error) throw error;
  const unique = [...new Set((data ?? []).map((r) => r.topic as string))].sort();
  return unique;
}

/**
 * Get distinct years for a component.
 */
export async function getYears(component: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("alevel_math_questions")
    .select("paper_year")
    .eq("component", component)
    .not("paper_year", "is", null);

  if (error) throw error;
  const unique = [...new Set((data ?? []).map((r) => r.paper_year as string))].sort().reverse();
  return unique;
}

/**
 * Update ai_explanation for a question (used server-side in API route).
 */
export async function updateAiExplanation(id: number, explanation: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("alevel_math_questions")
    .update({ ai_explanation: explanation })
    .eq("id", id);
  if (error) throw error;
}
