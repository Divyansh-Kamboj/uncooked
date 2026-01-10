import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from "react-router-dom";

const AuthFlow = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  // Handle user authentication state
  // We want to stay on the landing page even if authenticated
  useEffect(() => {
    console.log('Auth state changed:', { isLoading, isAuthenticated });
  }, [isAuthenticated, isLoading]);

  const handleStart = () => {
    // Add a small delay for visual feedback if needed, but for now direct routing
    if (isAuthenticated) {
      // User is signed in, go explicitly to dashboard
      console.log('User is signed in, performing smart entry to dashboard');
      navigate('/dashboard');
    } else {
      // User is not signed in, redirect to Auth0 universal login
      loginWithRedirect({
        authorizationParams: {
          redirect_uri: `${window.location.origin}/callback`
        }
      });
    }
  };

  // Landing page
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      <div className="text-center space-y-6 max-w-4xl mx-auto z-10">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <h1 className="hero-title">
            Uncooked
          </h1>
          <span className="fire-flicker fire-glow text-6xl md:text-7xl lg:text-8xl select-none">
            🔥
          </span>
        </div>
        <p className="hero-tagline max-w-2xl mx-auto">
          Be prepared to be roasted!
        </p>
        <div className="pt-4">
          <span
            onClick={handleStart}
            className="click-to-start cursor-pointer transition-all duration-300 active:scale-95 active:opacity-80 hover:opacity-90"
          >
            click to start
          </span>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-fire-glow/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-fire-primary/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default AuthFlow;
