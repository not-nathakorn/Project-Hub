import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const CallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Security Check: Ensure we actually received a callback from the server
    // We look for common OAuth parameters like 'code', 'token', or 'access_token'
    const hasAuthParams = 
      searchParams.has('code') || 
      searchParams.has('token') || 
      searchParams.has('access_token') ||
      searchParams.has('id_token');

    if (hasAuthParams) {
      // In a real scenario, you would parse the token from the URL here.
      // For now, we assume if the user reaches this page with params, the auth was successful.
      // We set a token in localStorage to persist the session.
      const token = searchParams.get('token') || searchParams.get('access_token') || 'authenticated';
      localStorage.setItem('auth_token', token);
      
      // Redirect to the admin dashboard
      navigate('/admin');
    } else {
      // If someone tries to access /admin/callback directly without params (cheating),
      // we redirect them back to the login page or home
      console.error("Security Alert: Invalid callback attempt");
      navigate('/'); 
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Authenticating...</h2>
        <p className="text-muted-foreground">Please wait while we log you in.</p>
      </div>
    </div>
  );
};
