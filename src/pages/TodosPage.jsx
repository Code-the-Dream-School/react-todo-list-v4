import { useEffect, useCallback, useReducer } from 'react';
import { useSearchParams } from 'react-router';
import TodoList from '../features/Todos/TodoList/TodoList';
import TodoForm from '../features/Todos/TodoForm';
import SortBy from '../shared/SortBy';
import FilterInput from '../shared/FilterInput';
import StatusFilter from '../shared/StatusFilter';
import useDebounce from '../utils/useDebounce';
import {
  todoReducer,
  initialTodoState,
  TODO_ACTIONS,
} from '../reducers/todoReducer';
import { useAuth } from '../contexts/AuthContext';

const baseUrl = import.meta.env.VITE_BASE_URL;

function TodosPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  const {
    todoList,
    error,
    filterError,
    isTodoListLoading,
    sortBy,
    sortDirection,
    filterTerm,
    dataVersion,
  } = state;
  const debouncedFilterTerm = useDebounce(filterTerm, 300);

  // Get status filter from URL, default to 'all'
  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    async function fetchTodos() {
      dispatch({ type: TODO_ACTIONS.FETCH_START });
      const paramsObject = {
        sortBy,
        sortDirection,
      };
      if (debouncedFilterTerm) {
        paramsObject.find = debouncedFilterTerm;
      }
      const params = new URLSearchParams(paramsObject);
      const options = {
        method: 'GET',
        headers: {
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
      };
      try {
        const resp = await fetch(`${baseUrl}/api/tasks${params}`, options);
        if (resp.status === 401) {
          throw new Error('unauthorized');
        }
        if (!resp.ok) {
          throw new Error(resp.message || 'Failed to fetch todos');
        }
        const taskData = await resp.json();

        dispatch({
          type: TODO_ACTIONS.FETCH_SUCCESS,
          payload: { todos: taskData.tasks },
        });
      } catch (error) {
        const isFilterError =
          debouncedFilterTerm ||
          sortBy !== 'creationDate' ||
          sortDirection !== 'desc';
        dispatch({
          type: TODO_ACTIONS.FETCH_ERROR,
          payload: {
            message: isFilterError
              ? `Error filtering/sorting todos: ${error.message}`
              : `Error fetching todos: ${error.message}`,
            isFilterError,
          },
        });
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
    dispatch({
      type: TODO_ACTIONS.ADD_TODO_START,
      payload: { tempTodo: newTodo },
    });

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
      dispatch({
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: { tempId, savedTodo },
      });
      invalidateCache();
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.ADD_TODO_ERROR,
        payload: {
          message: `Error adding todo: ${newTodo.title} | Error message: ${error.message}`,
          tempId,
        },
      });
    }
  };

  const completeTodo = async (id) => {
    // Store original todo for rollback
    const originalTodo = todoList.find((todo) => todo.id === id);

    // Optimistic update
    dispatch({
      type: TODO_ACTIONS.COMPLETE_TODO_START,
      payload: { id },
    });

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
      dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS });
      invalidateCache();
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.COMPLETE_TODO_ERROR,
        payload: {
          message: `Error completing todo: ${originalTodo.title} | Error message: ${error.message}`,
          id,
          originalTodo,
        },
      });
    }
  };

  const updateTodo = async (editedTodo) => {
    // Store original todo for rollback
    const originalTodo = todoList.find((todo) => todo.id === editedTodo.id);

    // Optimistic update
    dispatch({
      type: TODO_ACTIONS.UPDATE_TODO_START,
      payload: { editedTodo },
    });

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
      dispatch({ type: TODO_ACTIONS.UPDATE_TODO_SUCCESS });
      invalidateCache();
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.UPDATE_TODO_ERROR,
        payload: {
          message: `Error updating todo: ${editedTodo.title} | Error message: ${error.message}`,
          id: editedTodo.id,
          originalTodo,
        },
      });
    }
  };

  const handleFilterChange = (newFilterTerm) => {
    dispatch({
      type: TODO_ACTIONS.SET_FILTER,
      payload: { filterTerm: newFilterTerm },
    });
  };

  const invalidateCache = useCallback(() => {
    console.log('Invalidating memo cache after todo mutation');
    dispatch({ type: TODO_ACTIONS.INVALIDATE_CACHE });
  }, []);

  return (
    <div>
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={() => dispatch({ type: TODO_ACTIONS.CLEAR_ERROR })}>
            Clear Error
          </button>
        </div>
      )}
      {filterError && (
        <div>
          <p>{filterError}</p>
          <button
            onClick={() => dispatch({ type: TODO_ACTIONS.CLEAR_FILTER_ERROR })}
          >
            Clear Filter Error
          </button>
          <button
            onClick={() => dispatch({ type: TODO_ACTIONS.RESET_FILTERS })}
          >
            Reset Filters
          </button>
        </div>
      )}
      {isTodoListLoading && <div>Loading todos...</div>}
      <SortBy
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={(newSortBy) =>
          dispatch({
            type: TODO_ACTIONS.SET_SORT,
            payload: { sortBy: newSortBy, sortDirection },
          })
        }
        onSortDirectionChange={(newSortDirection) =>
          dispatch({
            type: TODO_ACTIONS.SET_SORT,
            payload: { sortBy, sortDirection: newSortDirection },
          })
        }
      />
      <StatusFilter />
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
        statusFilter={statusFilter}
      />
    </div>
  );
}

export default TodosPage;
