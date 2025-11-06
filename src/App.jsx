import { useState } from 'react';
import './App.css';
import TodoList from './TodoList.jsx';
import TodoForm from './TodoForm.jsx';

function App() {
  const [todoList, setTodoList] = useState(todos);

  return (
    <div>
      <h1>Todo List</h1>
      <TodoForm />
      <TodoList todoList={todoList} />
    </div>
  );
}

export default App;
