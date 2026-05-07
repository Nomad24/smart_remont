"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { debounce } from "@/utils/helpers";

const CATEGORIES = [
  "Инструменты",
  "Отделочные материалы",
  "Напольные покрытия",
  "Электрика",
];

const SORT_OPTIONS = [
  { label: "По умолчанию", sort_by: "id", sort_order: "asc" },
  { label: "Цена: по возрастанию", sort_by: "price", sort_order: "asc" },
  { label: "Цена: по убыванию", sort_by: "price", sort_order: "desc" },
  { label: "Название: А→Я", sort_by: "name", sort_order: "asc" },
  { label: "Название: Я→А", sort_by: "name", sort_order: "desc" },
];

export default function FilterPanel({ filters, onChange }) {
  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState(filters.min_price || "");
  const [localMax, setLocalMax] = useState(filters.max_price || "");

  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const debouncedMin = useRef(debounce((val) => onChange({ ...filtersRef.current, min_price: val }), 600)).current;
  const debouncedMax = useRef(debounce((val) => onChange({ ...filtersRef.current, max_price: val }), 600)).current;

  // Sync local state when filters reset externally
  useEffect(() => { setLocalMin(filters.min_price || ""); }, [filters.min_price]);
  useEffect(() => { setLocalMax(filters.max_price || ""); }, [filters.max_price]);

  const setFilter = (key, val) => onChange({ ...filters, [key]: val });

  const selectedSort =
    SORT_OPTIONS.find(
      (o) =>
        o.sort_by === filters.sort_by && o.sort_order === filters.sort_order
    ) || SORT_OPTIONS[0];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
      {/* Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 md:cursor-default"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-blue-500" />
          Фильтры
        </span>
        <span className="md:hidden">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      <div className={`px-4 pb-4 space-y-5 ${open ? "block" : "hidden md:block"}`}>
        {/* Sort */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Сортировка
          </p>
          <select
            value={`${selectedSort.sort_by}_${selectedSort.sort_order}`}
            onChange={(e) => {
              const [sort_by, sort_order] = e.target.value.split("_");
              onChange({ ...filters, sort_by, sort_order });
            }}
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.label} value={`${o.sort_by}_${o.sort_order}`}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Категория
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => setFilter("category", "")}
                className="accent-blue-600"
              />
              Все категории
            </label>
            {CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === c}
                  onChange={() => setFilter("category", c)}
                  className="accent-blue-600"
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Цена, ₽
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="От"
              value={localMin}
              onChange={(e) => { setLocalMin(e.target.value); debouncedMin(e.target.value); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0}
            />
            <input
              type="number"
              placeholder="До"
              value={localMax}
              onChange={(e) => { setLocalMax(e.target.value); debouncedMax(e.target.value); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0}
            />
          </div>
        </div>

        <button
          onClick={() =>
            onChange({
              category: "",
              min_price: "",
              max_price: "",
              sort_by: "id",
              sort_order: "asc",
            })
          }
          className="w-full text-sm text-gray-500 hover:text-red-500 transition border border-gray-200 rounded-lg py-2"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
}
