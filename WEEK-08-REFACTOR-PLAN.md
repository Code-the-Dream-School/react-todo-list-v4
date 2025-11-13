# Week 8 Optimization Refactoring Plan

## Project Overview

This document outlines the refactoring plan for Week 8 of the React Todo List curriculum, focusing on performance optimization using advanced hooks (useCallback, useMemo), React.memo, and implementing server-side filtering with debounced filter functionality.

## Refactoring Goals

- Implement useMemo for caching filter terms and event handlers
- Add server-side filtering capabilities
- Create debounced filter input for better UX and performance
- Add comprehensive filter and sort controls

---

## Todo List

### Phase 1: Implement API-based sorting

- [ ] **Update useEffect in TodosPage with API sort defaults**
  - add useState: `sortBy` initial value of `"creationDate"`
  - add useState: `sortDirection` initial value of `desc`
  - update fetch `tasks?sortBy=${sortBy}&sortDirection=${sortDirection}`
  - update useEffect dependencies

- [ ] **Add sort dropdowns**
  - create a new SortBy component in shared/ directory.
    - consists of 2 dropdowns: Sort by, Direction. Defaults set by passed in props
    - updates `sortBy`: values will only be `"creationDate"` or `"title"`
    - updates `sortDirection`: values only only be `"desc"` or `"asc"`
  - place instance at bottom of TodosPage
    - props: `sortBy`, `sortDirection`, `onSetSortBy={setSortBy}`, `onSetSortDirection={setSortDirection}`

### Phase 2: Implement API-based filter

- [ ] **Create custom useDebounce hook**
  - *Implement custom hook before FilterInput to prevent students from flooding API while developing filter feature*
  - Build reusable useDebounce hook in utils/ directory that accepts a value and delay, returns debounced value. Use useEffect with setTimeout and cleanup function to prevent memory leaks.
  
- [ ] **Add filter input component**
  - Create a new FilterInput component in shared/ directory
    - controlled input, placeholder text, and proper accessibility (label, htmlFor).
    - query param used by API: `find`
    - Include debounced functionality using custom hook or useEffect with cleanup.

- [ ] **Add filter state to TodosPage**
  - Add filterTerm state to TodosPage.jsx, integrate FilterInput component, pass filter handlers as props. Implement useCallback for filter change handler to prevent unnecessary re-renders.

- [ ] **Implement useCallback for filter and sort options**
  - Wrap url creation logic with useCallback with proper dependencies.

- [ ] **Implement useMemo for filtered todos**
  - Replace simple filter in TodoList.jsx with useMemo to memoize filtered results.
  - Include filter term, and sort order as dependencies
  - Invalidate memos when user adds new todo or modifies existing todo title using a data version pattern.

```jsx
const [dataVersion, setDataVersion] = useState(0);

// Invalidate cache when data changes
const invalidateCache = useCallback(() => {
  setDataVersion(prev => prev + 1);
}, []);

const memoizedTodos = useMemo(() => {
  return filteredAndSortedTodos;
}, [todoList, filterTerm, sortBy, dataVersion]); // Include dataVersion

// Call invalidateCache after mutations
const handleAddTodo = async (newTodo) => {
  // ... API call
  invalidateCache();
};`
```

### Phase 3: Enhanced User Experience

- [ ] **Update error handling for filter/filter**
  - Enhance error handling to distinguish between regular CRUD operation errors and filter/filter errors. Provide specific error messages and recovery options for filter failures.

---

## Implementation Notes

### Key Performance Concepts

- **useCallback**: Memoizes functions to prevent unnecessary re-renders of child components
- **useMemo**: Memoizes expensive calculations like filtering and sorting operations
- **Debouncing**: Delays API calls until user stops typing to reduce server load

### Current Architecture

- TodosPage.jsx handles all API calls and state management
- Uses optimistic updates for todos for better UX
- Error handling with user-friendly messages and rollback mechanisms
- CSRF token authentication via X-CSRF-TOKEN header

### Educational Focus

This refactoring prioritizes progressive learning and clear code examples suitable for Week 8 curriculum objectives. Each phase builds incrementally on previous concepts while introducing new optimization techniques.

---

## Success Criteria

- [ ] Filter functionality works with debounced input
- [ ] Server-side filtering reduces unnecessary data transfer
- [ ] Component re-renders are minimized (verified with React DevTools)
- [ ] Loading states provide clear user feedback
- [ ] Error handling is comprehensive and user-friendly
- [ ] Code maintains educational clarity and follows established patterns

---

*Last Updated: November 12, 2025*
*Branch: 08-optimization-hooks*
