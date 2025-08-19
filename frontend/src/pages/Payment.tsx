import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const Payment = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { refreshUser } = useAuth();

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
      console.log('Processing payment for plan:', selectedPlan);
      
      // Upsert user in Supabase (insert or update)
      const { error } = await supabase.from('users').upsert([
        {
          id: user.sub,
          email: user.email,
          plan: selectedPlan,
          is_paid: true,
          created_at: new Date().toISOString(),
        },
      ]);
      
      if (error) {
        console.error('Supabase error:', error);
        alert('Payment simulation failed: ' + error.message);
      } else {
        console.log('Payment successful, updating user data...');
        localStorage.removeItem('selectedPlan');
        
        // Refresh user data to get the updated plan
        await refreshUser();
        console.log('User data refreshed, AuthProvider will handle navigation...');
      }
    } catch (e) {
      console.error('Payment error:', e);
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
