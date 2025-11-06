import { Linter } from 'eslint';
import './App.css';

function App() {
  const todoList = [
    { id: 1, title: 'clone repo' },
    { id: 2, title: 'install' },
    { id: 3, title: 'run dev server' },
  ];

  return (
    <div>
      <h1>Todo List: For Mentor Reference</h1>
      <ul>
        {todoList.map((todo) => {
          <li key={todo.id}>{todo.title}</li>;
        })}
      </ul>
    </div>
  );
}

export default App;
