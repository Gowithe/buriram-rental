import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      description,
      daily_price,
      deposit_amount,
      buffer_hours,
      status,
      categories (
        name,
        icon
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !product) {
    notFound();
  }

  const category = product.categories as unknown as {
    name: string;
    icon: string;
  } | null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">
            {category?.icon} {category?.name}
          </div>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          <p className="mt-3 text-gray-600">
            {product.short_description}
          </p>

          {product.description && (
            <p className="mt-4 text-sm leading-6 text-gray-600">
              {product.description}
            </p>
          )}

          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-2xl font-bold text-gray-900">
              {Number(product.daily_price).toLocaleString()} บาท
              <span className="ml-1 text-sm font-normal text-gray-500">
                / 24 ชั่วโมง
              </span>
            </p>

            <p className="mt-2 text-gray-700">
              ค่ามัดจำ{" "}
              <span className="font-semibold">
                {Number(product.deposit_amount).toLocaleString()} บาท
              </span>
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Buffer หลังคืนสินค้า {product.buffer_hours} ชั่วโมง
            </p>
          </div>
          <Link
          href={`/booking/${product.slug}`}
          className="mt-6 block w-full rounded-xl bg-gray-900 px-4 py-3 text-center font-medium text-white"
          >
            เลือกวันเช่า
          </Link>
        </div>
      </div>
    </main>
  );
}