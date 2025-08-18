import React, { useState, useEffect } from 'react';
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

type AuthStep = 'landing' | 'signin' | 'signup';

const AuthFlow = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('landing');
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  // Handle user authentication state
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // User is signed in, go directly to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  const handleStart = () => {
    if (isSignedIn) {
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
          <SignIn 
            appearance={{
              elements: {
                card: "bg-white shadow-lg rounded-xl p-8",
                formButtonPrimary: "bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded",
              },
            }}
          />
          <div className="mt-4 text-center">
            <button 
              onClick={handleSignUpClick}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              Don't have an account? Sign up
            </button>
          </div>
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
          <SignUp
            appearance={{
              elements: {
                card: "bg-white shadow-lg rounded-xl p-8",
                formButtonPrimary: "bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded",
              },
            }}
          />
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              By signing up, you agree to our{" "}
              <button 
                onClick={() => window.open('/terms-and-conditions', '_blank')}
                className="text-orange-600 hover:text-orange-700 underline"
              >
                Terms & Conditions
              </button>{" "}
              and{" "}
              <button 
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="text-orange-600 hover:text-orange-700 underline"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthFlow;
