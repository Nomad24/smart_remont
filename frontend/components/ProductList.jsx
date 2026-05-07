"use client";

import { Droppable } from "@hello-pangea/dnd";
import ProductCard from "./ProductCard";

export default function ProductList({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <span className="text-6xl mb-4">🔍</span>
        <p className="text-lg font-medium">Товары не найдены</p>
        <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос</p>
      </div>
    );
  }

  return (
    <Droppable droppableId="product-list" direction="horizontal" isDropDisabled>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
