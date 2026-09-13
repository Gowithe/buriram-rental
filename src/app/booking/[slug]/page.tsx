import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";

export default async function BookingPage({
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
      daily_price,
      deposit_amount,
      status
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-orange-600">
            BURIRAM RENTAL
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            เลือกวันเช่า
          </h1>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-900">
              {product.name}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              ค่าเช่า{" "}
              {Number(product.daily_price).toLocaleString()} บาท / 24 ชั่วโมง
            </p>

            <p className="text-sm text-gray-600">
              มัดจำ{" "}
              {Number(product.deposit_amount).toLocaleString()} บาท
            </p>
          </div>

          <BookingForm
            productId={Number(product.id)}
            productName={product.name}
            dailyPrice={Number(product.daily_price)}
            depositAmount={Number(product.deposit_amount)}
          />
        </div>
      </div>
    </main>
  );
}