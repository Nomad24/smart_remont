import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import Navbar from "@/components/Navbar";
import ComparePanel from "@/components/ComparePanel";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata = {
  title: "Smart Remont — Каталог товаров",
  description: "Интерактивный каталог строительных и отделочных материалов",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body suppressHydrationWarning className={`${inter.className} min-h-screen`} style={{ background: 'var(--background)' }}>
        <AuthProvider>
          <CartProvider>
            <CompareProvider>
              <ToastProvider />
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
              <ComparePanel />
            </CompareProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
