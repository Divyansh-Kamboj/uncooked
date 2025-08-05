import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Redirect to signin if not signed in
  useEffect(() => {
    if (!user) {
      navigate('/signin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setSelectedPlan(localStorage.getItem('selectedPlan'));
  }, []);

  const handleContinue = async () => {
    if (!selectedPlan || !user) return;
    setLoading(true);
    try {
      // Upsert user in Supabase (insert or update)
      const { error } = await supabase.from('users').upsert([
        {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          plan: selectedPlan,
          is_paid: true,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        alert('Payment simulation failed: ' + error.message);
      } else {
        localStorage.removeItem('selectedPlan');
        navigate('/dashboard');
      }
    } catch (e) {
      alert('Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Confirm Your Plan</h1>
        <p className="mb-6">Selected plan: <span className="font-semibold text-orange-600">{selectedPlan}</span></p>
        <Button onClick={handleContinue} disabled={loading || !selectedPlan} className="w-full">
          {loading ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default Payment;
