"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { debounce } from "@/utils/helpers";

export default function SearchBar({ value, onChange }) {
  const [local, setLocal] = useState(value || "");
  const debouncedChange = useRef(debounce(onChange, 400)).current;

  useEffect(() => {
    setLocal(value || "");
  }, [value]);

  const handleChange = (e) => {
    setLocal(e.target.value);
    debouncedChange(e.target.value);
  };

  const clear = () => {
    setLocal("");
    onChange("");
  };

  return (
    <div className="relative flex-1 min-w-0">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder="Поиск товаров..."
        className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
      {local && (
        <button
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
