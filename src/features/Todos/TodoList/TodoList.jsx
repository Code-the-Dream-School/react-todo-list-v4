import { useMemo } from 'react';
import TodoListItem from './TodoListItem.jsx';

function TodoList({ todoList, onCompleteTodo, onUpdateTodo, dataVersion }) {
  const filteredTodoList = useMemo(() => {
    console.log(`Recalculating filtered todos (v${dataVersion})`);
    // Use dataVersion in the calculation to satisfy ESLint
    const _ = dataVersion; // Acknowledge the dependency
    return todoList.filter((todo) => !todo.isCompleted);
  }, [todoList, dataVersion]);

  return filteredTodoList.length === 0 ? (
    <p>Add todo above to get started</p>
  ) : (
    <ul>
      {filteredTodoList.map((todo) => (
        <TodoListItem
          key={todo.id}
          todo={todo}
          onCompleteTodo={onCompleteTodo}
          onUpdateTodo={onUpdateTodo}
        />
      ))}
    </ul>
  );
}

export default TodoList;
