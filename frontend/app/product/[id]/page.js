import ProductDetail from "@/components/ProductDetail";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getProduct(id) {
  const res = await fetch(`${API_URL}/api/products/${id}/`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Товар не найден" };
  return { title: `${product.name} — Smart Remont`, description: product.description };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
      >
        <ChevronLeft size={16} />
        Назад к каталогу
      </Link>
      <ProductDetail product={product} />
    </div>
  );
}
