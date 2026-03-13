import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Registration from '../features/Registration';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/todos', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main>
      <section aria-labelledby='register-heading'>
        <h1 id='register-heading'>Create an account</h1>
        <Registration />
      </section>
    </main>
  );
}

export default RegisterPage;
