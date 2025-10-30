import { useState, useRef } from 'react';

function TodoForm({ onAddTodo }) {
  const [workingTodoTitle, setWorkingTodoTitle] = useState('');
  const inputRef = useRef();

  const handleAddTodo = (event) => {
    event.preventDefault();
    
    if (workingTodoTitle.trim()) {
      onAddTodo(workingTodoTitle);
      setWorkingTodoTitle('');
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleAddTodo}>
      <label htmlFor="todoTitle">Todo</label>
      <input 
        type="text" 
        id="todoTitle" 
        name="todoTitle"
        ref={inputRef}
        value={workingTodoTitle}
        onChange={(event) => setWorkingTodoTitle(event.target.value)}
        required
      />
      <button type="submit" disabled={!workingTodoTitle.trim()}>Add Todo</button>
    </form>
  );
}

export default TodoForm;
