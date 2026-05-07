"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-blue-600 text-lg tracking-tight">
          Smart Remont
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.username}
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition"
            >
              <User size={16} />
              Войти
            </button>
          )}

          {user ? (
            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none h-[18px]">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="relative p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
            >
              <ShoppingCart size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
    {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
