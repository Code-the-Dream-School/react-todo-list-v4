import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Logon() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingOn, setIsLoggingOn] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoggingOn(true);
    setAuthError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        // Login successful, context will update automatically
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
        <p>Log onto to get started</p>
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

export default Logon;
