function TodoList() {
  const todoList = [
    { id: 1, title: 'clone repo' },
    { id: 2, title: 'install' },
    { id: 3, title: 'run dev server' },
  ];

  return (
    <ul>
      {todoList.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}

export default TodoList;
