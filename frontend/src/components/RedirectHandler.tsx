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
      
      // If the redirect URL is a hash route, navigate to it
      if (redirectUrl.includes('#')) {
        const hashRoute = redirectUrl.split('#')[1];
        if (hashRoute) {
          navigate(`#${hashRoute}`, { replace: true });
        }
      }
    }
  }, [navigate, location]);

  return null;
};
