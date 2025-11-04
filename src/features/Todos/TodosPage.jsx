import { useState } from 'react';
import TodoList from "./TodoList/TodoList"
import TodoForm from "./TodoForm"

function TodosPage() {
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

  const updateTodo = (editedTodo) => {
    const updatedTodos = todoList.map((todo) => {
      if (todo.id === editedTodo.id) {
        return { ...editedTodo };
      } else {
        return todo;
      }
    });
    setTodoList(updatedTodos);
  };

  return (
   <div>
    <h1>Todo List</h1>
    <TodoForm onAddTodo={addTodo} />
    <TodoList todoList={todoList} onCompleteTodo={completeTodo} onUpdateTodo={updateTodo} />
   </div>
  )
}

export default TodosPage
