"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Trash2, ShoppingBag, LogIn } from "lucide-react";
import { Droppable } from "@hello-pangea/dnd";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/utils/helpers";
import AuthModal from "@/components/AuthModal";

// standalone=true — страница /cart (без DnD контекста извне)
// standalone=false — боковая панель на главной (внутри DragDropContext)
export default function Cart({ standalone = false }) {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  // Неавторизован
  if (!user) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200 bg-white">
          <LogIn size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Войдите, чтобы видеть корзину</p>
          <button
            onClick={() => setShowAuth(true)}
            className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
          >
            Войти
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  // Загрузка
  if (loading) {
    return (
      <div className="p-6 space-y-4 bg-white rounded-2xl border border-gray-100">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Пустая корзина
  if (!cart.items.length) {
    const inner = (
      <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200 bg-white">
        <ShoppingBag size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Корзина пуста</p>
        {!standalone && (
          <p className="text-sm text-gray-400 mt-1">
            Перетащите товар или нажмите «В корзину»
          </p>
        )}
      </div>
    );

    if (standalone) return inner;

    return (
      <Droppable droppableId="cart-drop-zone">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed transition-colors ${
              snapshot.isDraggingOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <ShoppingBag size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Корзина пуста</p>
            <p className="text-sm text-gray-400 mt-1">
              {snapshot.isDraggingOver
                ? "Отпустите, чтобы добавить"
                : "Перетащите товар или нажмите «В корзину»"}
            </p>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  // Список товаров
  const itemsBlock = (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">
          Корзина ({cart.items.length})
        </h2>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-600 transition flex items-center gap-1"
        >
          <Trash2 size={13} />
          Очистить
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-3 px-5 py-4">
            <div className="w-14 h-14 bg-gray-50 rounded-xl flex-shrink-0 relative overflow-hidden">
              {item.product.image ? (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex items-center justify-center h-full text-2xl">
                  📦
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                {item.product.name}
              </p>
              <p className="text-blue-600 font-bold text-sm mt-1">
                {formatPrice(item.total_price)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-300 hover:text-red-400 transition"
              >
                <Trash2 size={14} />
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    item.quantity > 1
                      ? updateItem(item.id, item.quantity - 1)
                      : removeItem(item.id)
                  }
                  className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <Minus size={11} />
                </button>
                <span className="text-sm font-medium w-5 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateItem(item.id, item.quantity + 1)}
                  className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-gray-600 text-sm">Итого:</span>
        <span className="font-bold text-lg text-gray-800">
          {formatPrice(cart.total_price)}
        </span>
      </div>
    </>
  );

  if (standalone) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white">
        {itemsBlock}
      </div>
    );
  }

  return (
    <Droppable droppableId="cart-drop-zone">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`rounded-2xl border transition-colors ${
            snapshot.isDraggingOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-100 bg-white"
          }`}
        >
          {itemsBlock}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
