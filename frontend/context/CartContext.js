"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
} from "@/services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total_price: 0 });
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchCart();
      setCart(data);
    } catch {
      // silent — not authenticated yet
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Optimistic add
  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (!user) {
        toast.error("Войдите, чтобы добавить товар в корзину");
        return;
      }

      // Optimistic update
      setCart((prev) => {
        const existing = prev.items.find((i) => i.product.id === product.id);
        if (existing) {
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.product.id === product.id
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    total_price:
                      parseFloat(i.product.price) * (i.quantity + quantity),
                  }
                : i
            ),
          };
        }
        return {
          ...prev,
          items: [
            ...prev.items,
            {
              id: `temp-${product.id}`,
              product,
              quantity,
              total_price: parseFloat(product.price) * quantity,
            },
          ],
        };
      });

      try {
        await addToCart(product.id, quantity);
        await loadCart();
        toast.success(`«${product.name}» добавлен в корзину`);
      } catch {
        await loadCart(); // rollback
        toast.error("Не удалось добавить товар");
      }
    },
    [user, loadCart]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      const prev = cart;
      setCart((c) => ({
        ...c,
        items: c.items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                quantity,
                total_price: parseFloat(i.product.price) * quantity,
              }
            : i
        ),
      }));
      try {
        await updateCartItem(itemId, quantity);
        await loadCart();
      } catch {
        setCart(prev);
        toast.error("Не удалось обновить количество");
      }
    },
    [cart, loadCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      const prev = cart;
      setCart((c) => ({ ...c, items: c.items.filter((i) => i.id !== itemId) }));
      try {
        await deleteCartItem(itemId);
        await loadCart();
        toast.success("Товар удалён из корзины");
      } catch {
        setCart(prev);
        toast.error("Не удалось удалить товар");
      }
    },
    [cart, loadCart]
  );

  const clearCart = useCallback(async () => {
    const items = [...cart.items];
    setCart({ items: [], total_price: 0 });
    try {
      await Promise.all(items.map((i) => deleteCartItem(i.id)));
      toast.success("Корзина очищена");
    } catch {
      await loadCart();
      toast.error("Не удалось очистить корзину");
    }
  }, [cart.items, loadCart]);

  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, loading, addItem, updateItem, removeItem, clearCart, itemCount, loadCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
