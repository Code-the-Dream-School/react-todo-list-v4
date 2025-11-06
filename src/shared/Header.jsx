import Logoff from '../features/Logoff';

function Header(props) {
  const { token } = props;
  return (
    <>
      <h1>Todo List</h1>
      {token && <Logoff {...props} />}
    </>
  );
}

export default Header;
