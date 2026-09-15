import Image from "next/image";
import Link from "next/link";
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

  const isHoover =
    product.slug === "hoover-cleanslate-pro-max";

  return (
    <main className="min-h-screen bg-[#f7f6f4] text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[74px] max-w-6xl items-center justify-between gap-5 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-gray-900 text-xl">
              ⌂
            </div>

            <div>
              <div className="text-lg font-black leading-none">
                Buriram Rental
              </div>

              <div className="mt-1 hidden text-[11px] text-gray-500 sm:block">
                เช่าง่าย ใช้สะดวก ใกล้บ้านคุณ
              </div>
            </div>
          </Link>

          <Link
            href={`/products/${product.slug}`}
            className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold transition hover:bg-gray-50"
          >
            ← รายละเอียดสินค้า
          </Link>
        </div>
      </header>

      {/* PAGE */}
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        {/* BREADCRUMB */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-600">
            หน้าแรก
          </Link>

          <span>›</span>

          <Link
            href={`/products/${product.slug}`}
            className="hover:text-red-600"
          >
            {product.name}
          </Link>

          <span>›</span>

          <strong className="text-gray-800">
            จองสินค้า
          </strong>
        </div>

        {/* TITLE */}
        <div className="mb-7">
          <p className="text-xs font-black tracking-wide text-red-600">
            BOOKING
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            เลือกวันและเวลาที่ต้องการเช่า
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            เลือกวันรับและวันคืนสินค้า
            จากนั้นระบบจะตรวจสอบคิวว่างและคำนวณราคาให้อัตโนมัติ
          </p>
        </div>

        {/* PROGRESS */}
        <div className="mb-7 grid grid-cols-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-r border-gray-100 bg-red-50 px-2 py-4 text-center">
            <div className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-red-600 text-xs font-bold text-white">
              1
            </div>

            <p className="mt-2 text-[11px] font-bold text-red-700 sm:text-xs">
              เลือกวัน
            </p>
          </div>

          <div className="border-r border-gray-100 px-2 py-4 text-center">
            <div className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
              2
            </div>

            <p className="mt-2 text-[11px] font-semibold text-gray-500 sm:text-xs">
              ตรวจสอบคิว
            </p>
          </div>

          <div className="border-r border-gray-100 px-2 py-4 text-center">
            <div className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
              3
            </div>

            <p className="mt-2 text-[11px] font-semibold text-gray-500 sm:text-xs">
              ข้อมูลผู้เช่า
            </p>
          </div>

          <div className="px-2 py-4 text-center">
            <div className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
              4
            </div>

            <p className="mt-2 text-[11px] font-semibold text-gray-500 sm:text-xs">
              ชำระเงิน
            </p>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_330px]">
          {/* BOOKING FORM */}
          <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5">
              <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-700">
                ขั้นตอนที่ 1
              </span>

              <h2 className="mt-3 text-xl font-bold">
                ตรวจสอบวันว่าง
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                วันที่สีเขียวสามารถเลือกเพื่อเริ่มจองได้
              </p>
            </div>

            <BookingForm
              productId={Number(product.id)}
              productName={product.name}
              dailyPrice={Number(product.daily_price)}
              depositAmount={Number(product.deposit_amount)}
            />
          </section>

          {/* ORDER SUMMARY */}
          <aside className="lg:sticky lg:top-[98px]">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              {isHoover && (
                <div className="relative bg-[#f5f3f0] p-5">
                  <Image
                    src="/images/hoover-cleanslate-01.webp"
                    alt={product.name}
                    width={500}
                    height={500}
                    className="mx-auto h-auto w-full max-w-[240px] object-contain"
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-green-700 shadow-sm">
                    ● เปิดให้เช่า
                  </div>
                </div>
              )}

              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-red-600">
                  สินค้าที่เลือก
                </p>

                <h2 className="mt-2 text-lg font-bold leading-snug">
                  {product.name}
                </h2>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-sm text-gray-500">
                      ค่าเช่าเริ่มต้น
                    </span>

                    <div className="text-right">
                      <strong className="text-2xl font-black text-red-600">
                        {Number(
                          product.daily_price
                        ).toLocaleString()}
                      </strong>

                      <span className="ml-1 text-xs font-semibold">
                        บาท
                      </span>
                    </div>
                  </div>

                  <p className="mt-1 text-right text-[11px] text-gray-500">
                    / 24 ชั่วโมง
                  </p>
                </div>

                <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-sm">
                  <span className="text-gray-500">
                    เงินประกัน
                  </span>

                  <strong>
                    {Number(
                      product.deposit_amount
                    ).toLocaleString()}{" "}
                    บาท
                  </strong>
                </div>

                <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-xs leading-5 text-gray-600">
                  <p className="font-bold text-gray-900">
                    ราคาหลายวัน
                  </p>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <strong className="block">
                        399
                      </strong>
                      <span>1 วัน</span>
                    </div>

                    <div>
                      <strong className="block">
                        699
                      </strong>
                      <span>2 วัน</span>
                    </div>

                    <div>
                      <strong className="block text-red-600">
                        899
                      </strong>
                      <span>3 วัน</span>
                    </div>
                  </div>

                  <p className="mt-3 text-center text-[10px] text-gray-500">
                    หลังวันที่ 3 เพิ่ม 200 บาท / วัน
                  </p>
                </div>

                <div className="mt-5 space-y-2 text-xs text-gray-600">
                  <p>✓ เลือกวันและเวลาได้เอง</p>
                  <p>✓ เลือกรับเองหรือจัดส่ง</p>
                  <p>✓ ค่าจัดส่งคำนวณตามระยะทางจริง</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-xs leading-5 text-gray-500">
              <strong className="text-gray-800">
                ยังไม่มีการเรียกเก็บเงินในขั้นตอนนี้
              </strong>

              <p className="mt-1">
                หลังยืนยันรายการจอง
                ระบบจะแสดงหน้าชำระเงินและ QR สำหรับรายการนั้น
              </p>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mt-10 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 py-7 text-xs text-gray-500 sm:flex-row sm:px-6">
          <div>
            <strong className="text-sm text-gray-900">
              Buriram Rental
            </strong>
            <p className="mt-1">
              เช่าง่าย ใช้สะดวก ใกล้บ้านคุณ
            </p>
          </div>

          <Link
            href="/products"
            className="font-semibold hover:text-red-600"
          >
            ดูสินค้าให้เช่าทั้งหมด
          </Link>
        </div>
      </footer>
    </main>
  );
}