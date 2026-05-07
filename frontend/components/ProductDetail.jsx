"use client";

import Image from "next/image";
import { ShoppingCart, BarChart2 } from "lucide-react";
import { toast } from "react-toastify";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/utils/helpers";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function ProductDetail({ product }) {
  const { addItem } = useCart();
  const { toggle, isSelected } = useCompare();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleAddToCart() {
    if (!user) { setShowAuth(true); return; }
    setAdding(true);
    try {
      await addItem(product);
      toast.success("Добавлено в корзину");
    } catch {
      toast.error("Ошибка при добавлении");
    } finally {
      setAdding(false);
    }
  }

  const inCompare = isSelected(product.id);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative h-72 md:h-full min-h-64 bg-gray-50">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-6xl">
                📦
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-4">
            <div>
              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 mb-2">
                {product.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <p className="text-3xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-medium transition"
              >
                <ShoppingCart size={18} />
                {adding ? "Добавляем..." : "В корзину"}
              </button>
              <button
                onClick={() => toggle(product)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-medium transition ${
                  inCompare
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-300"
                }`}
              >
                <BarChart2 size={16} />
                {inCompare ? "В сравнении" : "Сравнить"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
