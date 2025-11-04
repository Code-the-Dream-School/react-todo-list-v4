import { useState } from "react"

function Logon({onSetUser, onSetUserToken}){

const baseUrl = import.meta.env.VITE_BASE_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError ] = useState("");
  
  async function handleSubmit(e){
    e.preventDefault()
    try {
      const options = {body: JSON.stringify({email, password}), method: "POST", headers: {"Content-Type":"application/json" }, credentials: "include"}
      const res = await fetch(`${baseUrl}/user/logon`, options);
      const data = await res.json();
      console.dir(res)
      if (res.status === 200 && data.name && data.csrfToken){
        onSetUser(data.name);
        onSetUserToken(data.csrfToken);
      } else {
        setAuthError(`Authentication failed: ${data?.message}`);
      }
    } catch (error) {
        setAuthError(`Error: ${error.name} | ${error.message}`)
    }
  }
  
  return(
    <form onSubmit={handleSubmit}>
      <p>Log into your todo list</p>
      <label htmlFor="email">email
      </label>
        <input type="text" name="email" value={email} onChange={e => setEmail(e.target.value)} required/>
      <label htmlFor="password">password
      </label>
        <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} required/>
      <button>Submit</button>
    </form>
  )
}

export default Logon;
