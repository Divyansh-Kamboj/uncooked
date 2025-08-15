import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: number;
  question_img: string | null;
  answer_img: string | null;
  question_number: string | null;
  paper_code: string | null;
  paper_year: string | null;
  session: string | null;
  topic: string | null;
  difficulty: string | null;
  component: string | null;
  ai_explanation: string | null;
}

interface UseQuestionsProps {
  filters: {
    subject: string;
    year: string[];
    topic: string[];
    session: string[];
    difficulty: string;
  };
  paperLoaded: boolean;
}

export const useQuestions = ({ filters, paperLoaded }: UseQuestionsProps) => {
  const initialLoad = useRef(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only require subject (paper) and year for a valid search
    if (!paperLoaded || !filters.subject || filters.year.length === 0) {
      setQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      // DEBUG LOG: Show filters
      console.log("[useQuestions] Filters sent to query:", filters);

      try {
        let query = supabase
          .from('alevel_math_questions')
          .select('*')
          .eq('component', filters.subject) // paper filter maps to component field
          .in('paper_year', filters.year)   // year filter maps to paper_year field
          .not('question_img', 'is', null);

        // Apply optional filters
        if (filters.topic.length > 0) {
          query = query.in('topic', filters.topic);
        }
        if (filters.session.length > 0) {
          query = query.in('session', filters.session); // session filter maps to session field
        }
        if (filters.difficulty && filters.difficulty !== "All") {
          query = query.eq('difficulty', filters.difficulty);
        }

        const { data, error: queryError } = await query.order('question_number');

        // DEBUG LOG: Show returned data and error
        console.log("[useQuestions] Supabase data:", data);
        console.log("[useQuestions] Supabase error:", queryError);

        if (queryError) throw queryError;

        setQuestions(data || []);
        initialLoad.current = false;
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      } finally {
        // Only update loading state if we're not in the initial load
        if (!initialLoad.current) {
          setLoading(false);
        }
      }
    };

    fetchQuestions();
  }, [filters, paperLoaded]);

  return { questions, loading, error };
};