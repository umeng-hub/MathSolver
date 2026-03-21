import React, { createContext, useContext, useState, useCallback } from 'react';

const HistoryContext = createContext(null);

/**
 * HistoryProvider stores an ordered list of solved expressions.
 * Each entry: { id, expression, result, steps, solvedAt }
 */
export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);

  /** Add a new entry to the top of the history list */
  const addEntry = useCallback(({ expression, result, steps }) => {
    const entry = {
      id: Date.now().toString(),
      expression,
      result,
      steps,
      solvedAt: new Date().toISOString(),
    };
    setHistory(prev => [entry, ...prev]);
  }, []);

  /** Remove all history entries */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  /** Remove a single entry by id */
  const removeEntry = useCallback((id) => {
    setHistory(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <HistoryContext.Provider value={{ history, addEntry, clearHistory, removeEntry }}>
      {children}
    </HistoryContext.Provider>
  );
}

/** Convenience hook – throws if used outside HistoryProvider */
export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used inside HistoryProvider');
  return ctx;
}
