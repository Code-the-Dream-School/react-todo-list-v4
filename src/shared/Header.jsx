import Logoff from '../features/Logoff';
import Navigation from './Navigation';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <h1>Todo List</h1>
      <Navigation />
      {isAuthenticated && <Logoff />}
    </>
  );
}

export default Header;
