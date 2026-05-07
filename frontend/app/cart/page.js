"use client";

import { DragDropContext } from "@hello-pangea/dnd";
import Cart from "@/components/Cart";

export default function CartPage() {
  return (
    <DragDropContext onDragEnd={() => {}}>
      <div className="max-w-2xl mx-auto py-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Корзина</h1>
        <Cart standalone />
      </div>
    </DragDropContext>
  );
}
