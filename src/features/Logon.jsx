import { useState } from 'react';

function Logon({ onSetEmail, onSetToken }) {
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingOn, setIsLoggingOn] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoggingOn(true);
    try {
      const options = {
        body: JSON.stringify({ email, password }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      };
      const res = await fetch(`${baseUrl}/user/logon`, options);
      const data = await res.json();
      console.dir(res);
      if (res.status === 200 && data.name && data.csrfToken) {
        onSetEmail(data.name);
        onSetToken(data.csrfToken);
      } else {
        setAuthError(`Authentication failed: ${data?.message}`);
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
