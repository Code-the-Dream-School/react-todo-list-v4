import { useState, useEffect, useCallback } from 'react';
import TodoList from './TodoList/TodoList';
import TodoForm from './TodoForm';
import SortBy from '../../shared/SortBy';
import FilterInput from '../../shared/FilterInput';
import useDebounce from '../../utils/useDebounce';

const baseUrl = import.meta.env.VITE_BASE_URL;

function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState('');
  const [filterError, setFilterError] = useState('');
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);
  const [sortBy, setSortBy] = useState('creationDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterTerm, setFilterTerm] = useState('');
  const [dataVersion, setDataVersion] = useState(0);
  const debouncedFilterTerm = useDebounce(filterTerm, 300);

  useEffect(() => {
    async function fetchTodos() {
      setIsTodoListLoading(true);
      const params = new URLSearchParams({
        sortBy,
        sortDirection,
        ...(debouncedFilterTerm && { find: debouncedFilterTerm }),
      });
      const options = {
        method: 'GET',
        headers: {
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
      };
      try {
        const resp = await fetch(`${baseUrl}/tasks?${params}`, options);
        if (resp.status === 401) {
          throw new Error('unauthorized');
        }
        if (!resp.ok) {
          throw new Error(resp.message || 'Failed to fetch todos');
        }
        const todos = await resp.json();
        setTodoList(todos);
        setFilterError(''); // Clear any filter errors on successful fetch
      } catch (error) {
        if (
          debouncedFilterTerm ||
          sortBy !== 'creationDate' ||
          sortDirection !== 'desc'
        ) {
          setFilterError(`Error filtering/sorting todos: ${error.message}`);
        } else {
          setError(`Error fetching todos: ${error.message}`);
        }
      } finally {
        setIsTodoListLoading(false);
      }
    }
    if (token) {
      fetchTodos();
    }
  }, [token, sortBy, sortDirection, debouncedFilterTerm]);

  const addTodo = async (todoTitle) => {
    const tempId = Date.now();
    const newTodo = {
      id: tempId,
      title: todoTitle,
      isCompleted: false,
    };

    // Optimistic update
    setTodoList((currentList) => [...currentList, newTodo]);

    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify({
          title: newTodo.title,
          isCompleted: newTodo.isCompleted,
        }),
        credentials: 'include',
      };
      const resp = await fetch(`${baseUrl}/tasks`, options);
      if (!resp.ok) {
        throw new Error(resp.message || 'Failed to add todo');
      }
      const savedTodo = await resp.json();

      // Replace temp todo with real todo
      setTodoList((currentList) =>
        currentList.map((todo) => (todo.id === tempId ? savedTodo : todo))
      );
      invalidateCache();
    } catch (error) {
      setError(
        `Error adding todo: ${newTodo.title} | Error message: ${error.message}`
      );
      // Remove the failed todo
      setTodoList((currentList) =>
        currentList.filter((todo) => todo.id !== tempId)
      );
    }
  };

  const completeTodo = async (id) => {
    // Store original todo for rollback
    const originalTodo = todoList.find((todo) => todo.id === id);

    // Optimistic update
    setTodoList((currentList) =>
      currentList.map((todo) => {
        if (todo.id === id) {
          return { ...todo, isCompleted: true };
        } else {
          return todo;
        }
      })
    );

    try {
      const options = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify({
          isCompleted: true,
          createdTime: originalTodo.createdTime,
        }),
        credentials: 'include',
      };
      const resp = await fetch(`${baseUrl}/tasks/${id}`, options);
      if (!resp.ok) {
        throw new Error(resp.message || 'Failed to complete todo');
      }
      invalidateCache();
    } catch (error) {
      setError(
        `Error completing todo: ${originalTodo.title} | Error message: ${error.message}`
      );
      // Rollback the optimistic update
      setTodoList((currentList) =>
        currentList.map((todo) => (todo.id === id ? originalTodo : todo))
      );
    }
  };

  const updateTodo = async (editedTodo) => {
    // Store original todo for rollback
    const originalTodo = todoList.find((todo) => todo.id === editedTodo.id);

    // Optimistic update
    setTodoList((currentList) =>
      currentList.map((todo) => {
        if (todo.id === editedTodo.id) {
          return { ...editedTodo };
        } else {
          return todo;
        }
      })
    );

    try {
      const options = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify({
          title: editedTodo.title,
          isCompleted: editedTodo.isCompleted,
          createdTime: editedTodo.createdTime,
        }),
        credentials: 'include',
      };
      const resp = await fetch(`${baseUrl}/tasks/${editedTodo.id}`, options);
      if (!resp.ok) {
        throw new Error(resp.message || 'Failed to update todo');
      }
      invalidateCache();
    } catch (error) {
      setError(
        `Error updating todo: ${editedTodo.title} | Error message: ${error.message}`
      );
      // Rollback the optimistic update
      setTodoList((currentList) =>
        currentList.map((todo) =>
          todo.id === editedTodo.id ? originalTodo : todo
        )
      );
    }
  };

  const handleFilterChange = useCallback((newFilterTerm) => {
    setFilterTerm(newFilterTerm);
  }, []);

  const invalidateCache = useCallback(() => {
    console.log('Invalidating memo cache after todoList updates');
    setDataVersion((prev) => prev + 1);
  }, []);

  return (
    <div>
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={() => setError('')}>Clear Error</button>
        </div>
      )}
      {filterError && (
        <div>
          <p>{filterError}</p>
          <button onClick={() => setFilterError('')}>Clear Filter Error</button>
          <button
            onClick={() => {
              setFilterTerm('');
              setSortBy('creationDate');
              setSortDirection('desc');
              setFilterError('');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
      {isTodoListLoading && <div>Loading todos...</div>}
      <SortBy
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={setSortBy}
        onSortDirectionChange={setSortDirection}
      />
      <FilterInput
        filterTerm={filterTerm}
        onFilterChange={handleFilterChange}
      />
      <TodoForm onAddTodo={addTodo} />
      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        dataVersion={dataVersion}
      />
    </div>
  );
}

export default TodosPage;
