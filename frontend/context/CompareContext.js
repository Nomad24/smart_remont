"use client";

import { createContext, useContext, useState, useCallback } from "react";

const CompareContext = createContext(null);
const MAX_COMPARE = 3;

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]);

  const toggle = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const isSelected = useCallback(
    (id) => items.some((p) => p.id === id),
    [items]
  );

  return (
    <CompareContext.Provider value={{ items, toggle, clear, isSelected }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
