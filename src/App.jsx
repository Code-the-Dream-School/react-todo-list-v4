import { useState } from 'react';
import './App.css'
import TodosPage from './features/Todos/TodosPage'
import Login from './features/Login';

function App() {

  const [user, setUser] = useState("");
  const [userToken, setUserToken] = useState("");

  return (
    <>
      <Login onSetUser={setUser} onSetUserToken={setUserToken}/>
      {userToken ? <TodosPage/>: "log in to get started"}
    </>
  )
}

export default App;
