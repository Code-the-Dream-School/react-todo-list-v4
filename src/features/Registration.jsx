import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../contexts/AuthContext';

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function Registration() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsRegistering(true);
    setRegError('');

    if (!siteKey) {
      setRegError(
        'Registration is unavailable right now. Please try again later.'
      );
      setIsRegistering(false);
      return;
    }

    if (password !== passwordConfirm) {
      setRegError("The passwords entered didn't match.");
      setIsRegistering(false);
      return;
    }

    if (!recaptchaToken) {
      setRegError(
        'Please complete the reCAPTCHA challenge before registering.'
      );
      setIsRegistering(false);
      return;
    }

    try {
      const result = await register(
        name.trim(),
        email,
        password,
        recaptchaToken
      );

      if (!result.success) {
        setRegError(result.error);
      }
    } catch (error) {
      setRegError(`Error: ${error.name} | ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby='register-instructions'>
      <p id='register-instructions'>
        Enter your account details below to create a new account.
      </p>

      <fieldset>
        <legend>Account details</legend>

        <label htmlFor='register-name'>Name</label>
        <input
          id='register-name'
          type='text'
          name='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete='name'
          required
        />

        <label htmlFor='register-email'>Email</label>
        <input
          id='register-email'
          type='email'
          name='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete='email'
          required
        />
      </fieldset>

      <fieldset>
        <legend>Security</legend>

        <label htmlFor='register-password'>Password</label>
        <input
          id='register-password'
          type='password'
          name='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete='new-password'
          required
        />

        <label htmlFor='register-password-confirm'>Confirm password</label>
        <input
          id='register-password-confirm'
          type='password'
          name='passwordConfirmation'
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          autoComplete='new-password'
          required
        />
      </fieldset>

      <fieldset>
        <legend>Verification</legend>
        <p id='recaptcha-help'>
          Complete the reCAPTCHA challenge. If you need a non-visual option, use
          the audio challenge available in the widget.
        </p>
        <div aria-describedby='recaptcha-help'>
          <ReCAPTCHA
            sitekey={siteKey}
            onChange={(token) => setRecaptchaToken(token || '')}
            onExpired={() => setRecaptchaToken('')}
            onErrored={() =>
              setRegError(
                'The reCAPTCHA challenge could not be loaded. Please try again.'
              )
            }
          />
        </div>
      </fieldset>

      <button type='submit' disabled={isRegistering}>
        {isRegistering ? <>Registration in progress...</> : <>Register</>}
      </button>

      {regError && (
        <p role='alert' aria-live='polite'>
          {regError}
        </p>
      )}
    </form>
  );
}

export default Registration;
