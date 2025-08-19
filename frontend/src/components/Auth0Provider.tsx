import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

interface Auth0ProviderWrapperProps {
  children: React.ReactNode;
}

const Auth0ProviderWrapper: React.FC<Auth0ProviderWrapperProps> = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = `${window.location.origin}/callback`;

  if (!domain || !clientId) {
    console.error('Auth0 configuration missing. Please check your environment variables.');
    return <div>Auth0 configuration error</div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'openid profile email'
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWrapper;
