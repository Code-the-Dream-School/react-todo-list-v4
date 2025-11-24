import './App.css';
import TodosPage from './features/Todos/TodosPage';
import Logon from './features/Logon';
import Header from './shared/Header';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Header />
      {isAuthenticated ? (
        <TodosPage />
      ) : (
        <>
          <Logon />
        </>
      )}
    </>
  );
}

export default App;
