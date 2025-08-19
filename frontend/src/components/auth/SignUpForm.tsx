import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { loginWithRedirect } = useAuth0();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          redirect_uri: `${window.location.origin}/callback`
        }
      });
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Create a password (min 8 characters)"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button 
          onClick={onSwitchToSignIn}
          className="text-sm text-orange-600 hover:text-orange-700"
        >
          Already have an account? Sign in
        </button>
      </div>

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
  );
};

export default SignUpForm;
