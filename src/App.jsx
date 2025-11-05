import { useState } from "react";
import "./App.css";
import TodosPage from "./features/Todos/TodosPage";
import Logon from "./features/Logon";
import Header from "./shared/Header";

function App() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  

  return (
    <>
      <Header token={token} onSetToken={setToken} onSetEmail={setEmail}></Header>
      {token ? (
        <TodosPage />
      ) : (
        <>
          <Logon onSetEmail={setEmail} onSetToken={setToken} />
        </>
      )}
    </>
  );
}

export default App;
