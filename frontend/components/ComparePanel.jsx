"use client";

import { X } from "lucide-react";
import { formatPrice } from "@/utils/helpers";
import { useCompare } from "@/context/CompareContext";

const FIELDS = [
  { key: "category", label: "Категория" },
  { key: "price", label: "Цена", format: formatPrice },
  { key: "description", label: "Описание" },
];

export default function ComparePanel() {
  const { items, toggle, clear } = useCompare();

  if (!items.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">
            Сравнение ({items.length}/3)
          </span>
          <button
            onClick={clear}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Очистить
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left text-gray-500 font-medium pr-4 py-1 w-28">
                  Параметр
                </th>
                {items.map((p) => (
                  <th key={p.id} className="text-left py-1 pr-4 min-w-40">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-gray-800 leading-snug line-clamp-2">
                        {p.name}
                      </span>
                      <button
                        onClick={() => toggle(p)}
                        className="text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5 transition"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((f) => (
                <tr key={f.key} className="border-t border-gray-100">
                  <td className="text-gray-500 py-1.5 pr-4 font-medium">
                    {f.label}
                  </td>
                  {items.map((p) => (
                    <td key={p.id} className="py-1.5 pr-4 text-gray-700">
                      {f.format ? f.format(p[f.key]) : p[f.key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
