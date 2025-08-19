import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from "react-router-dom";
import SignInForm from './auth/SignInForm';
import SignUpForm from './auth/SignUpForm';

type AuthStep = 'landing' | 'signin' | 'signup';

const AuthFlow = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('landing');
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Handle user authentication state
  useEffect(() => {
    console.log('Auth state changed:', { isLoading, isAuthenticated, currentStep });
    if (!isLoading && isAuthenticated) {
      // User is signed in, go directly to dashboard
      console.log('User is signed in, navigating to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, currentStep]);

  const handleStart = () => {
    if (isAuthenticated) {
      // User is already signed in, go to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // User is not signed in, show signin form
      setCurrentStep('signin');
    }
  };

  const handleSignUpClick = () => {
    setCurrentStep('signup');
  };

  const handleBackToSignIn = () => {
    setCurrentStep('signin');
  };

  const handleBackToLanding = () => {
    setCurrentStep('landing');
  };

  // Landing page
  if (currentStep === 'landing') {
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
              className="click-to-start cursor-pointer"
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
  }

  // Sign In page
  if (currentStep === 'signin') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <button 
              onClick={handleBackToLanding}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              ← Back to home
            </button>
          </div>
          <SignInForm onSwitchToSignUp={handleSignUpClick} />
        </div>
      </div>
    );
  }

  // Sign Up page
  if (currentStep === 'signup') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <button 
              onClick={handleBackToSignIn}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              ← Back to sign in
            </button>
          </div>
          <SignUpForm onSwitchToSignIn={handleBackToSignIn} />
        </div>
      </div>
    );
  }

  return null;
};

export default AuthFlow;
