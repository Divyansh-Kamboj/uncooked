import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Auth0Callback: React.FC = () => {
  const { isAuthenticated, user, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (isLoading) return;
      
      if (error) {
        console.error('Auth0 error:', error);
        navigate('/', { replace: true });
        return;
      }

      if (isAuthenticated && user) {
        try {
          // Check if user exists in Supabase
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.sub)
            .single();

          if (fetchError && fetchError.code === 'PGRST116') {
            // User doesn't exist, create them
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: user.sub,
                  email: user.email,
                  plan: null,
                  is_paid: false,
                  created_at: new Date().toISOString(),
                },
              ]);

            if (insertError) {
              console.error('Error creating user in Supabase:', insertError);
            } else {
              console.log('User created in Supabase successfully');
            }
          } else if (fetchError) {
            console.error('Error fetching user from Supabase:', fetchError);
          } else {
            console.log('User already exists in Supabase');
          }

          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        } catch (err) {
          console.error('Error handling auth callback:', err);
          navigate('/', { replace: true });
        }
      }
    };

    handleAuthCallback();
  }, [isAuthenticated, user, isLoading, error, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Signing you in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication failed</p>
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Auth0Callback;
