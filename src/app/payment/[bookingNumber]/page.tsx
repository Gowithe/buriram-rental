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
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-xl rounded-2xl bg-red-50 p-5 text-red-700">
          เกิดข้อผิดพลาด: {error.message}
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
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-xl rounded-2xl bg-red-50 p-5 text-red-700">
          ไม่พบ PROMPTPAY_ID ใน .env.local
        </div>
      </main>
    );
  }

  const amount = Number(booking.grand_total);

  const payload = generatePayload(promptPayId, {
    amount,
  });

  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 320,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-orange-600">
            BURIRAM RENTAL
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            ชำระเงิน
          </h1>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              เลขที่การจอง
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {booking.booking_number}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              สินค้า
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {booking.product_name}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ค่าเช่า
              </span>

              <span>
                {Number(
                  booking.rental_amount
                ).toLocaleString()}{" "}
                บาท
              </span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-600">
                ค่ามัดจำ
              </span>

              <span>
                {Number(
                  booking.deposit_amount
                ).toLocaleString()}{" "}
                บาท
              </span>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold">
                  ยอดชำระทั้งหมด
                </span>

                <span className="text-xl font-bold">
                  {amount.toLocaleString()} บาท
                </span>
              </div>
            </div>
          </div>

          {booking.payment_status === "paid" ? (
            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-center text-green-700">
              ✅ ชำระเงินเรียบร้อยแล้ว
            </div>
          ) : expired ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm text-red-700">
              <p className="font-semibold">
                หมดเวลาชำระเงินแล้ว
              </p>

              <p className="mt-2">
                การจองนี้หมดอายุ กรุณากลับไปเลือกวันเช่าใหม่
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-center text-sm text-orange-800">
                <p>
                  กรุณาชำระเงินภายใน 15 นาที
                  เพื่อรักษาสิทธิ์การจอง
                </p>

                {booking.payment_expires_at && (
                  <Countdown
                    expiresAt={booking.payment_expires_at}
                  />
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 p-6 text-center">
                <p className="font-semibold text-gray-900">
                  สแกน QR PromptPay
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  ยอด {amount.toLocaleString()} บาท
                </p>

                <img
                  src={qrDataUrl}
                  alt="PromptPay QR Code"
                  width={320}
                  height={320}
                  className="mx-auto mt-5 max-w-full"
                />

                <a
                  href={qrDataUrl}
                  download={`promptpay-${booking.booking_number}.png`}
                  className="mt-5 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center font-medium text-gray-800 hover:bg-gray-50"
                >
                  ดาวน์โหลด QR
                </a>

                <p className="mt-3 text-xs text-gray-500">
                  สำหรับมือถือ: ดาวน์โหลด QR แล้วเปิดแอปธนาคาร
                  เพื่อเลือกภาพ QR จากแกลเลอรี
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  กรุณาตรวจสอบยอดเงินในแอปธนาคารก่อนยืนยันการโอน
                </p>
              </div>

              <SlipUpload
               bookingNumber={booking.booking_number}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}