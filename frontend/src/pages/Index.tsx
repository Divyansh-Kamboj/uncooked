import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSignedIn, navigate]);

  const handleStart = () => {
    // For HashRouter, navigate without hash prefix
    navigate("/signin");
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
            onClick={handleStart}
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
