"use client";

import Image from "next/image";
import Link from "next/link";
import { Draggable } from "@hello-pangea/dnd";
import { ShoppingCart, BarChart2, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { formatPrice } from "@/utils/helpers";

export default function ProductCard({ product, index }) {
  const { addItem } = useCart();
  const { toggle, isSelected } = useCompare();
  const inCompare = isSelected(product.id);

  return (
    <Draggable draggableId={String(product.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
            snapshot.isDragging ? "opacity-80 rotate-1 shadow-xl" : ""
          }`}
        >
          <Link href={`/product/${product.id}`} className="block relative h-48 bg-gray-50">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 300px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl select-none">
                📦
              </div>
            )}
            <span className="absolute top-2 left-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {product.category}
            </span>
          </Link>

          <div className="flex flex-col gap-2 p-4 flex-1">
            <Link
              href={`/product/${product.id}`}
              className="font-medium text-gray-800 text-sm leading-snug line-clamp-2 hover:text-blue-600 transition-colors"
            >
              {product.name}
            </Link>

            <p className="text-blue-600 font-bold text-lg mt-auto">
              {formatPrice(product.price)}
            </p>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => addItem(product)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium py-2 rounded-xl transition-all duration-150"
              >
                <ShoppingCart size={15} />
                В корзину
              </button>

              <button
                onClick={() => toggle(product)}
                title="Сравнить"
                className={`p-2 rounded-xl border transition-all duration-150 ${
                  inCompare
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500"
                }`}
              >
                {inCompare ? <Check size={15} /> : <BarChart2 size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
