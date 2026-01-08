import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { loginWithRedirect } = useAuth0();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: `${window.location.origin}/callback`
        }
      });
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ff7800] px-4 py-12">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-extrabold text-center mb-4 text-gray-900">Welcome</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Log in to your uncooked account.</p>
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
            className="w-full px-4 py-3 border-2 border-orange-300 rounded-full focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 bg-white"
            placeholder="Email address*"
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
            placeholder="Password*"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#ff7a00] hover:bg-[#ff6a00] text-white font-bold py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? 'Signing in...' : 'Continue'}
        </button>

        <div className="mt-4 flex items-center gap-3">
          <hr className="flex-1 border-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <button
          type="button"
          onClick={() => loginWithRedirect({ connection: 'google-oauth2' })}
          className="mt-4 w-full border border-gray-300 rounded-full py-3 flex items-center justify-center gap-3 bg-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M533.5 278.4c0-17.7-1.6-35.6-4.9-52.6H272.1v99.6h147.2c-6.4 34.8-25.4 64.3-54.3 84v69.8h87.8c51.3-47.3 81.7-117 81.7-201.8z"/></svg>
          Continue with Google
        </button>
      </form>

      </div>
    </div>
  );
};

export default SignInForm;
