import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            BURIRAM RENTAL
          </p>

          <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900">
            เช่าเครื่องทำความสะอาด
            <br />
            ง่าย ๆ ไม่ต้องซื้อเครื่องเอง
          </h1>

          <p className="mt-4 text-gray-600">
            เหมาะสำหรับทำความสะอาดโซฟา พรม ที่นอน
            และเบาะรถยนต์
          </p>

          <div className="mt-7 rounded-2xl bg-gray-50 p-5">
            <p className="text-sm font-medium text-orange-600">
              พร้อมให้เช่า
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Hoover CleanSlate Pro Max
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              เครื่องซักโซฟา • พรม • ที่นอน • เบาะรถ
            </p>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  ค่าเช่า
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  399 บาท
                </p>

                <p className="text-sm text-gray-500">
                  / 24 ชั่วโมง
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  ค่ามัดจำ
                </p>

                <p className="font-semibold text-gray-900">
                  1,000 บาท
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/products/hoover-cleanslate-pro-max"
            className="mt-6 block w-full rounded-xl bg-gray-900 px-4 py-4 text-center font-semibold text-white"
          >
            เช่าเครื่องนี้
          </Link>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            ขั้นตอนการเช่า
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 font-semibold text-white">
                1
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  เลือกวันเช่า
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  เลือกวันและเวลารับ-คืนสินค้า
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 font-semibold text-white">
                2
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  กรอกข้อมูลการจอง
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  กรอกชื่อ เบอร์โทร และวิธีรับสินค้า
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 font-semibold text-white">
                3
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  ชำระเงิน
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  สแกน PromptPay และอัปโหลดสลิป
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 font-semibold text-white">
                4
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  รับเครื่อง
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  รับเครื่องตามวันและเวลาที่จองไว้
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-orange-100 bg-orange-50 p-5">
          <p className="font-semibold text-orange-900">
            ก่อนเช่า
          </p>

          <p className="mt-2 text-sm leading-6 text-orange-800">
            กรุณาตรวจสอบวันว่างก่อนชำระเงิน
            ระบบจะล็อกสิทธิ์การจองไว้ 15 นาทีระหว่างการชำระเงิน
          </p>
        </section>

        <p className="mt-8 text-center text-xs text-gray-400">
          BURIRAM RENTAL
        </p>
      </div>
    </main>
  );
}