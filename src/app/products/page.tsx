import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      daily_price,
      deposit_amount,
      status,
      categories (
        name,
        slug,
        icon
      )
    `)
    .eq("status", "active")
    .order("id", { ascending: true });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-orange-600">
            BURIRAM RENTAL
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            สินค้าให้เช่า
          </h1>

          <p className="mt-2 text-gray-600">
            เลือกอุปกรณ์ที่ต้องการ แล้วดูราคาและค่ามัดจำได้ทันที
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-700">
            Error: {error.message}
          </div>
        )}

        {/* No products */}
        {!error && products?.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            ยังไม่มีสินค้าเปิดให้เช่า
          </div>
        )}

        {/* Product Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => {
            const category = product.categories as unknown as {
              name: string;
              slug: string;
              icon: string;
            } | null;

            return (
              <article
                key={product.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                {/* Category */}
                <div className="mb-3 text-sm text-gray-500">
                  {category?.icon} {category?.name}
                </div>

                {/* Product Name */}
                <h2 className="text-xl font-semibold text-gray-900">
                  {product.name}
                </h2>

                {/* Description */}
                <p className="mt-2 min-h-12 text-sm text-gray-600">
                  {product.short_description}
                </p>

                {/* Price */}
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-lg font-bold text-gray-900">
                    {Number(product.daily_price).toLocaleString()} บาท

                    <span className="ml-1 text-sm font-normal text-gray-500">
                      / 24 ชั่วโมง
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    มัดจำ{" "}
                    <span className="font-medium text-gray-900">
                      {Number(product.deposit_amount).toLocaleString()} บาท
                    </span>
                  </p>
                </div>

                {/* Product Detail Link */}
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-5 block w-full rounded-xl bg-gray-900 px-4 py-3 text-center font-medium text-white"
                >
                  ดูรายละเอียด
                </Link>
              </article>
            );
          })}
        </div>

      </div>
    </main>
  );
}