import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
// profile is of type Database["public"]["Tables"]["users"]["Row"] | null
import { supabase } from "@/lib/supabaseClient";

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    setSelectedPlan(localStorage.getItem('selectedPlan'));
  }, []);

  const handleContinue = async () => {
    if (!selectedPlan || !user) return;
    setLoading(true);
    try {
      await supabase.from('users').update({ plan: selectedPlan, paid: true }).eq('id', user.id);
      await refreshProfile();
      localStorage.removeItem('selectedPlan');
      navigate('/dashboard');
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
