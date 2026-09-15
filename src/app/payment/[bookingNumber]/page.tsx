import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import Countdown from "./Countdown";
import SlipUpload from "./SlipUpload";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ bookingNumber: string }>;
}) {
  const { bookingNumber } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_booking_payment",
    {
      p_booking_number: bookingNumber,
    }
  );

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f6f4] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-bold">ไม่สามารถโหลดข้อมูลการชำระเงินได้</p>
          <p className="mt-2 text-sm">{error.message}</p>
        </div>
      </main>
    );
  }

  const booking = data?.[0];

  if (!booking) {
    notFound();
  }

  const expired =
    booking.payment_expires_at &&
    new Date(booking.payment_expires_at).getTime() < Date.now() &&
    booking.payment_status !== "paid";

  const promptPayId = process.env.PROMPTPAY_ID;

  if (!promptPayId) {
    return (
      <main className="min-h-screen bg-[#f7f6f4] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          ไม่พบข้อมูล PromptPay สำหรับสร้าง QR
        </div>
      </main>
    );
  }

  const rentalAmount = Number(booking.rental_amount);
  const depositAmount = Number(booking.deposit_amount);
  const amount = Number(booking.grand_total);

  // grand_total จากฐานข้อมูลเป็นยอดจริงที่ใช้สร้าง QR
  // หากเป็นการจัดส่ง ยอดนี้รวมค่าจัดส่งแล้ว
  const additionalAmount = Math.max(
    0,
    amount - rentalAmount - depositAmount
  );

  const payload = generatePayload(promptPayId, {
    amount,
  });

  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 320,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  const isPaid = booking.payment_status === "paid";

  return (
    <main className="min-h-screen bg-[#f7f6f4] text-gray-900">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex min-h-[74px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
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

          <div className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600">
            ชำระเงิน
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* PROGRESS */}
        <div className="mb-7 grid grid-cols-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {[
            ["1", "เลือกวัน"],
            ["2", "ตรวจสอบคิว"],
            ["3", "ข้อมูลผู้เช่า"],
          ].map(([number, label]) => (
            <div
              key={number}
              className="border-r border-gray-100 px-2 py-4 text-center"
            >
              <div className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-gray-900 text-xs font-bold text-white">
                ✓
              </div>

              <p className="mt-2 text-[10px] font-semibold text-gray-500 sm:text-xs">
                {label}
              </p>
            </div>
          ))}

          <div className="bg-red-50 px-2 py-4 text-center">
            <div className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-red-600 text-xs font-bold text-white">
              4
            </div>

            <p className="mt-2 text-[10px] font-bold text-red-700 sm:text-xs">
              ชำระเงิน
            </p>
          </div>
        </div>

        {/* TITLE */}
        <div className="mb-7">
          <p className="text-[11px] font-black uppercase tracking-wide text-red-600">
            PAYMENT
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {isPaid
              ? "ชำระเงินเรียบร้อยแล้ว"
              : "ชำระเงินเพื่อยืนยันการจอง"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            {isPaid
              ? "ระบบได้รับและตรวจสอบการชำระเงินของรายการนี้เรียบร้อยแล้ว"
              : "ตรวจสอบยอดเงิน สแกน QR PromptPay และอัปโหลดสลิปเพื่อยืนยันการจอง"}
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div className="space-y-5">
            {isPaid ? (
              <section className="rounded-3xl border border-green-200 bg-green-50 p-7 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-600 text-2xl font-black text-white">
                  ✓
                </div>

                <h2 className="mt-4 text-xl font-black text-green-900">
                  ชำระเงินเรียบร้อยแล้ว
                </h2>

                <p className="mt-2 text-sm leading-6 text-green-700">
                  การจองของคุณได้รับการยืนยันแล้ว
                </p>

                <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-white p-4">
                  <p className="text-xs text-gray-500">
                    เลขที่การจอง
                  </p>

                  <p className="mt-1 break-all font-black text-gray-900">
                    {booking.booking_number}
                  </p>
                </div>

                <Link
                  href="/"
                  className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-gray-900 px-6 text-sm font-bold text-white"
                >
                  กลับหน้าแรก
                </Link>
              </section>
            ) : expired ? (
              <section className="rounded-3xl border border-red-200 bg-red-50 p-7 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-600 text-xl font-black text-white">
                  !
                </div>

                <h2 className="mt-4 text-xl font-black text-red-900">
                  หมดเวลาชำระเงินแล้ว
                </h2>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  รายการนี้หมดอายุแล้ว
                  กรุณากลับไปเลือกวันและเวลาที่ต้องการเช่าใหม่
                </p>

                <Link
                  href="/products"
                  className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-red-600 px-6 text-sm font-bold text-white"
                >
                  กลับไปเลือกสินค้า
                </Link>
              </section>
            ) : (
              <>
                {/* TIMER */}
                <section className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-center">
                  <p className="text-sm font-bold text-orange-900">
                    กรุณาชำระเงินภายใน 15 นาที
                  </p>

                  <p className="mt-1 text-xs text-orange-700">
                    เพื่อรักษาสิทธิ์ของช่วงเวลาที่เลือก
                  </p>

                  {booking.payment_expires_at && (
                    <Countdown
                      expiresAt={booking.payment_expires_at}
                    />
                  )}
                </section>

                {/* QR */}
                <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="text-center">
                    <p className="text-[11px] font-black uppercase tracking-wide text-red-600">
                      PROMPTPAY
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      สแกน QR เพื่อชำระเงิน
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      กรุณาตรวจสอบยอดก่อนยืนยันการโอน
                    </p>
                  </div>

                  <div className="mx-auto mt-6 max-w-[350px] rounded-3xl border border-gray-200 bg-white p-4 text-center">
                    <img
                      src={qrDataUrl}
                      alt="PromptPay QR Code"
                      width={320}
                      height={320}
                      className="mx-auto h-auto max-w-full"
                    />
                  </div>

                  <div className="mt-5 text-center">
                    <p className="text-xs text-gray-500">
                      ยอดที่ต้องชำระ
                    </p>

                    <div className="mt-1">
                      <strong className="text-4xl font-black text-red-600">
                        {amount.toLocaleString()}
                      </strong>

                      <span className="ml-2 text-sm font-bold">
                        บาท
                      </span>
                    </div>
                  </div>

                  <a
                    href={qrDataUrl}
                    download={`promptpay-${booking.booking_number}.png`}
                    className="mt-6 flex min-h-[50px] w-full items-center justify-center rounded-2xl border border-gray-300 bg-white px-4 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
                  >
                    ดาวน์โหลด QR สำหรับชำระบนมือถือ
                  </a>

                  <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-xs leading-5 text-gray-500">
                    <strong className="text-gray-800">
                      ใช้งานบนมือถือ
                    </strong>
                    <p className="mt-1">
                      ดาวน์โหลด QR แล้วเปิดแอปธนาคาร
                      จากนั้นเลือกสแกน QR จากรูปภาพในเครื่อง
                    </p>
                  </div>
                </section>

                {/* SLIP */}
                <SlipUpload
                  bookingNumber={booking.booking_number}
                />
              </>
            )}
          </div>

          {/* RIGHT SUMMARY */}
          <aside className="lg:sticky lg:top-6">
            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5">
                <p className="text-[11px] font-black uppercase tracking-wide text-red-600">
                  BOOKING SUMMARY
                </p>

                <h2 className="mt-2 text-lg font-black">
                  สรุปรายการจอง
                </h2>
              </div>

              <div className="p-5">
                <div>
                  <p className="text-[11px] text-gray-400">
                    เลขที่การจอง
                  </p>

                  <p className="mt-1 break-all text-sm font-bold">
                    {booking.booking_number}
                  </p>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-5">
                  <p className="text-[11px] text-gray-400">
                    สินค้า
                  </p>

                  <p className="mt-1 font-bold">
                    {booking.product_name}
                  </p>
                </div>

                <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      ค่าเช่า
                    </span>

                    <strong>
                      {rentalAmount.toLocaleString()} บาท
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      เงินประกัน
                    </span>

                    <strong>
                      {depositAmount.toLocaleString()} บาท
                    </strong>
                  </div>

                  {additionalAmount > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">
                        ค่าบริการเพิ่มเติม
                        <small className="block text-[10px] text-gray-400">
                          รวมค่าจัดส่งในกรณีเลือกจัดส่ง
                        </small>
                      </span>

                      <strong>
                        {additionalAmount.toLocaleString()} บาท
                      </strong>
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-gray-200 pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <strong>ยอดชำระทั้งหมด</strong>

                    <div className="text-right">
                      <strong className="text-2xl font-black text-red-600">
                        {amount.toLocaleString()}
                      </strong>

                      <span className="ml-1 text-xs font-bold">
                        บาท
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-[11px] leading-5 text-gray-500">
                  เงินประกันจะดำเนินการคืนหลังได้รับสินค้า
                  และตรวจสอบเรียบร้อยตามเงื่อนไขการเช่า
                </div>
              </div>
            </section>

            {!isPaid && !expired && (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-xs leading-5 text-gray-500">
                <strong className="text-gray-800">
                  หลังโอนเงินแล้ว
                </strong>
                <p className="mt-1">
                  อัปโหลดสลิปในหน้านี้
                  ระบบจะตรวจสอบการชำระเงินก่อนยืนยันการจอง
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      <footer className="mt-10 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-7 text-xs text-gray-500 sm:px-6">
          <strong className="text-sm text-gray-900">
            Buriram Rental
          </strong>
          <p className="mt-1">
            เช่าง่าย ใช้สะดวก ใกล้บ้านคุณ
          </p>
        </div>
      </footer>
    </main>
  );
}