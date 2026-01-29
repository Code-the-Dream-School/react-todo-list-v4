import { useState } from 'react';

const baseUrl = import.meta.env.VITE_BASE_URL;

function Logoff({ token, onSetToken, onSetEmail }) {
  const [error, setError] = useState('');
  const [isLoggingOff, setIsLoggingOff] = useState(false);
  async function handleLogoff() {
    setIsLoggingOff(true);
    try {
      const options = {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
      };
      const res = await fetch(`${baseUrl}/users/logoff`, options);
      if (res.status === 200 || res.status === 401) {
        onSetEmail('');
        onSetToken('');
      } else {
        const data = await res.json();
        setError(data.message || 'Logoff failed');
        setIsLoggingOff(false);
      }
    } catch {
      setError('Error logging off');
    }
  }
  return (
    <>
      <button onClick={handleLogoff} disabled={isLoggingOff}>
        {isLoggingOff ? <>Logging off...</> : <>Log Off</>}
      </button>
      {error && <p>{error}</p>}
    </>
  );
}

export default Logoff;
