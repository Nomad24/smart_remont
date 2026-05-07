'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DragDropContext } from '@hello-pangea/dnd';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import FilterPanel from '@/components/FilterPanel';
import SearchBar from '@/components/SearchBar';
import ProductList from '@/components/ProductList';
import Pagination from '@/components/Pagination';
import Cart from '@/components/Cart';
import AuthModal from '@/components/AuthModal';
import { fetchProducts } from '@/services/api';
import { buildQueryString } from '@/utils/helpers';
import { toast } from 'react-toastify';

const LIMIT = 12;

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const offset = parseInt(searchParams.get('offset') || '0', 10) || 0;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sortBy = searchParams.get('sort_by') || 'id';
  const sortOrder = searchParams.get('sort_order') || 'asc';

  const filters = { search, category, min_price: minPrice, max_price: maxPrice, sort_by: sortBy, sort_order: sortOrder };

  useEffect(() => {
    setLoadingProducts(true);
    fetchProducts({ ...filters, limit: LIMIT, offset })
      .then((data) => { setProducts(data.results); setTotal(data.count); })
      .catch((err) => {
        console.error(err);
        toast.error('Не удалось загрузить товары');
      })
      .finally(() => setLoadingProducts(false));
  }, [offset, search, category, minPrice, maxPrice, sortBy, sortOrder]);

  function updateParams(updates) {
    const current = {};
    searchParams.forEach((v, k) => { current[k] = v; });
    const merged = { ...current, ...updates, offset: '0' };
    if (updates.offset !== undefined) merged.offset = updates.offset;
    router.push('/?' + buildQueryString(merged));
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    if (result.destination.droppableId === 'cart-drop-zone') {
      if (!user) { setShowAuth(true); return; }
      const product = products.find((p) => String(p.id) === result.draggableId);
      if (product) addItem(product);
    }
  }

  const currentPage = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Sidebar */}
        <aside className='lg:w-64 flex-shrink-0'>
          <FilterPanel
            filters={filters}
            onChange={(updates) => updateParams(updates)}
          />
        </aside>

        {/* Main */}
        <div className='flex-1 min-w-0 space-y-4'>
          <SearchBar
            value={search}
            onChange={(v) => updateParams({ search: v })}
          />
          <ProductList products={products} loading={loadingProducts} onAuthRequired={() => setShowAuth(true)} />
          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => updateParams({ offset: String((p - 1) * LIMIT) })}
            />
          )}
        </div>

        {/* Cart sidebar */}
        <aside className='lg:w-80 flex-shrink-0'>
          <div className='sticky top-20'>
            <Cart />
          </div>
        </aside>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </DragDropContext>
  );
}

import { Suspense } from 'react';
export default function HomePage() {
  return (
    <Suspense fallback={<div className='flex items-center justify-center py-32 text-gray-400'>Загрузка...</div>}>
      <HomePageInner />
    </Suspense>
  );
}
