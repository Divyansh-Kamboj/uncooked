import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Fetch user plan
        supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUserPlan(profile.plan);
            }
          });
      }
    });
  }, []);
  
  const handleStartSession = () => {
    if (session && userPlan) {
      // User is already signed in, redirect based on plan
      if (userPlan === 'free') {
        navigate("/pricing");
      } else {
        navigate("/dashboard");
      }
    } else {
      // User not signed in, go to signin page
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      {/* Main Container */}
      <div className="text-center space-y-6 max-w-4xl mx-auto z-10">
        
        {/* Main Title with Animated Fire */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <h1 className="hero-title">
            Uncooked
          </h1>
          <span className="fire-flicker fire-glow text-6xl md:text-7xl lg:text-8xl select-none">
            🔥
          </span>
        </div>

        {/* Tagline */}
        <p className="hero-tagline max-w-2xl mx-auto">
          Be prepared to be roasted!
        </p>

        {/* Click to Start Text */}
        <div className="pt-4">
          <span 
            onClick={handleStartSession}
            className="click-to-start"
          >
            click to start
          </span>
        </div>
      </div>

      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-fire-glow/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-fire-primary/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default Index;
