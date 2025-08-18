import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle Clerk redirect URLs that might cause loops
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect_url');
    
    if (redirectUrl) {
      // Clean up the URL by removing query parameters
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
      
      // Extract the route from the redirect URL
      try {
        const url = new URL(redirectUrl);
        const path = url.pathname;
        if (path && path !== '/') {
          navigate(path, { replace: true });
        }
      } catch (error) {
        console.warn('Invalid redirect URL:', redirectUrl);
      }
    }
  }, [navigate, location]);

  return null;
};
