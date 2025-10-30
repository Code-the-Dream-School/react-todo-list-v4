import { useState } from 'react';
import './App.css'
import TodoList from './TodoList.jsx';
import TodoForm from './TodoForm.jsx';

function App() {
  const [todoList, setTodoList] = useState([]);

  const addTodo = (todoTitle) => {
    const newTodo = {
      id: Date.now(),
      title: todoTitle,
      isCompleted: false
    };
    setTodoList([newTodo, ...todoList]);
  };

  const completeTodo = (id) => {
    setTodoList(
      todoList.map((todo) => {
        if (todo.id === id) {
          return { ...todo, isCompleted: true };
        } else {
          return todo;
        }
      })
    );
  };

  return (
   <div>
    <h1>Todo List</h1>
    <TodoForm onAddTodo={addTodo} />
    <TodoList todoList={todoList} onCompleteTodo={completeTodo} />
   </div>
  )
}

export default App
