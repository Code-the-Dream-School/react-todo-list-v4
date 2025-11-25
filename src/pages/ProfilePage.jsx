import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const baseUrl = import.meta.env.VITE_BASE_URL;

function ProfilePage() {
  const { name, token } = useAuth();
  const [todoStats, setTodoStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTodoStats() {
      if (!token) return;

      try {
        setLoading(true);
        setError('');

        const options = {
          method: 'GET',
          headers: {
            'X-CSRF-TOKEN': token,
          },
          credentials: 'include',
        };

        const response = await fetch(`${baseUrl}/tasks`, options);

        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }

        const todos = await response.json();

        // Calculate statistics
        const total = todos.length;
        const completed = todos.filter((todo) => todo.isCompleted).length;
        const active = total - completed;

        setTodoStats({ total, completed, active });
      } catch (err) {
        setError(`Error loading statistics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchTodoStats();
  }, [token]);

  return (
    <div>
      <h2>User Profile</h2>

      <div>
        <h3>Account Information</h3>
        <p>
          <strong>Name:</strong> {name}
        </p>
        <p>
          <strong>Account Status:</strong> Active
        </p>
      </div>

      <div>
        <h3>Todo Statistics</h3>
        {loading ? (
          <p>Loading statistics...</p>
        ) : error ? (
          <div>
            <p style={{ color: 'red' }}>{error}</p>
            <p>
              <em>
                Unable to load todo statistics. Make sure you have access to
                todos.
              </em>
            </p>
          </div>
        ) : (
          <div>
            <p>
              <strong>Total Todos:</strong> {todoStats.total}
            </p>
            <p>
              <strong>Completed Todos:</strong> {todoStats.completed}
            </p>
            <p>
              <strong>Active Todos:</strong> {todoStats.active}
            </p>
            {todoStats.total > 0 && (
              <p>
                <strong>Completion Rate:</strong>{' '}
                {Math.round((todoStats.completed / todoStats.total) * 100)}%
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <h3>Quick Actions</h3>
        <p>
          <a href='/todos'>Go to Todos</a> | <a href='/about'>About This App</a>
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;
