import { useState, useEffect } from "react";
import TodoList from "./TodoList/TodoList";
import TodoForm from "./TodoForm";

const baseUrl = import.meta.env.VITE_BASE_URL;

function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState("");
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);

  useEffect(() => {
    async function fetchTodos() {
      setIsTodoListLoading(true);
      const options = {
        method: "GET",
        headers: {
          "X-CSRF-TOKEN": token,
        },
        credentials: "include",
      };
      try {
        const resp = await fetch(`${baseUrl}/tasks`, options);
        if (resp.status === 401) {
          throw new Error("unauthorized");
        }
        if (!resp.ok) {
          throw new Error(resp.message || "Failed to fetch todos");
        }
        const todos = await resp.json();
        setTodoList(todos);
      } catch (error) {
        setError(`Error: ${error.name} | ${error.message}`);
      } finally {
        setIsTodoListLoading(false);
      }
    }
    if (token) {
      fetchTodos();
    }
  }, [token]);

  const addTodo = async (todoTitle) => {
    const tempId = Date.now();
    const newTodo = {
      id: tempId,
      title: todoTitle,
      isCompleted: false,
    };

    // Optimistic update
    setTodoList((currentList) => [newTodo, ...currentList]);

    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: JSON.stringify({
          title: newTodo.title,
          isCompleted: newTodo.isCompleted,
        }),
        credentials: "include",
      };
      const resp = await fetch(`${baseUrl}/tasks`, options);
      if (!resp.ok) {
        throw new Error(resp.message || "Failed to add todo");
      }
      const savedTodo = await resp.json();

      // Replace temp todo with real todo
      setTodoList((currentList) =>
        currentList.map((todo) => (todo.id === tempId ? savedTodo : todo))
      );
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: JSON.stringify({
          isCompleted: true,
          createdTime: originalTodo.createdTime,
        }),
        credentials: "include",
      };
      const resp = await fetch(`${baseUrl}/tasks/${id}`, options);
      if (!resp.ok) {
        throw new Error(resp.message || "Failed to complete todo");
      }
      const updatedTodo = await resp.json();

      // Update with server response
      setTodoList((currentList) =>
        currentList.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: JSON.stringify({
          title: editedTodo.title,
          isCompleted: editedTodo.isCompleted,
          createdTime: editedTodo.createdTime,
        }),
        credentials: "include",
      };
      const resp = await fetch(`${baseUrl}/tasks/${editedTodo.id}`, options);
      if (!resp.ok) {
        throw new Error(resp.message || "Failed to update todo");
      }
      const updatedTodo = await resp.json();

      // Update with server response
      setTodoList((currentList) =>
        currentList.map((todo) =>
          todo.id === editedTodo.id ? updatedTodo : todo
        )
      );
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

  return (
    <div>
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={() => setError("")}>Clear Error</button>
        </div>
      )}
      {isTodoListLoading && <div>Loading todos...</div>}
      <TodoForm onAddTodo={addTodo} />
      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
      />
    </div>
  );
}

export default TodosPage;
