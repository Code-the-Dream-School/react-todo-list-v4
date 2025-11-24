import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingOn, setIsLoggingOn] = useState(false);

  // Get intended destination from location state, default to /todos
  const from = location.state?.from?.pathname || '/todos';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoggingOn(true);
    setAuthError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        // Login successful, useEffect will handle redirect
      } else {
        setAuthError(result.error);
      }
    } catch (error) {
      setAuthError(`Error: ${error.name} | ${error.message}`);
    } finally {
      setIsLoggingOn(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <p>Log on to get started</p>
        <label htmlFor='email'>email</label>
        <input
          type='text'
          name='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor='password'>password</label>
        <input
          type='password'
          name='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button disabled={isLoggingOn}>
          {isLoggingOn ? <>Logon in progress...</> : <>Log On</>}
        </button>
      </form>
      {authError && <p>{authError}</p>}
    </>
  );
}

export default LoginPage;
