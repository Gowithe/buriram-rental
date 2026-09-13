import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusActions from "./StatusActions";
import DepositActions from "./DepositActions";

function formatDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  switch (status) {
    case "pending_payment":
      return "รอชำระเงิน";
    case "confirmed":
      return "ยืนยันแล้ว";
    case "picked_up":
      return "รับเครื่องแล้ว";
    case "returned":
      return "คืนเครื่องแล้ว";
    case "cancelled":
      return "ยกเลิก";
    default:
      return status;
  }
}

function getPaymentLabel(status: string) {
  switch (status) {
    case "paid":
      return "ชำระแล้ว";
    case "unpaid":
      return "ยังไม่ชำระ";
    default:
      return status;
  }
}

function getDepositLabel(status: string) {
  switch (status) {
    case "pending":
      return "รอคืนมัดจำ";
    case "refunded":
      return "คืนมัดจำแล้ว";
    default:
      return status;
  }
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingNumber: string }>;
}) {
  const { bookingNumber } = await params;

  const supabase = await createClient();

  // ตรวจว่ามีการ Login หรือยัง
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // ตรวจว่าเป็น Admin จริงหรือไม่
  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    redirect("/admin/login");
  }

  // ดึงรายละเอียด Booking
  const { data, error } = await supabase.rpc(
    "get_admin_booking_detail",
    {
      p_booking_number: bookingNumber,
    }
  );

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/bookings"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← กลับไปรายการจอง
          </Link>

          <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-orange-600">
              BURIRAM RENTAL
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              รายละเอียดการจอง
            </h1>

            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              ไม่สามารถโหลดข้อมูลได้: {error.message}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const booking = data?.[0];

  if (!booking) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/bookings"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← กลับไปรายการจอง
        </Link>

        <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            BURIRAM RENTAL
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            รายละเอียดการจอง
          </h1>

          <p className="mt-2 font-semibold text-gray-700">
            {booking.booking_number}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {getStatusLabel(booking.booking_status)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                booking.payment_status === "paid"
                  ? "bg-green-50 text-green-700"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              {getPaymentLabel(booking.payment_status)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                booking.deposit_status === "refunded"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {getDepositLabel(booking.deposit_status)}
            </span>
          </div>

          <section className="mt-6 rounded-2xl bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">
              ข้อมูลลูกค้า
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-gray-500">ชื่อ</p>
                <p className="mt-1 font-medium text-gray-900">
                  {booking.customer_name}
                </p>
              </div>

              <div>
                <p className="text-gray-500">เบอร์โทร</p>
                <p className="mt-1 font-medium text-gray-900">
                  {booking.customer_phone}
                </p>
              </div>

              <div>
                <p className="text-gray-500">LINE</p>
                <p className="mt-1 font-medium text-gray-900">
                  {booking.customer_line_contact || "-"}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">
              รายละเอียดสินค้า
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-gray-500">สินค้า</p>
                <p className="mt-1 font-medium text-gray-900">
                  {booking.product_name}
                </p>
              </div>

              <div>
                <p className="text-gray-500">รหัสเครื่อง</p>
                <p className="mt-1 font-medium text-gray-900">
                  {booking.asset_code || "-"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">วันรับ</p>
                <p className="mt-1 font-medium text-gray-900">
                  {formatDateTime(booking.start_datetime)}
                </p>
              </div>

              <div>
                <p className="text-gray-500">วันคืน</p>
                <p className="mt-1 font-medium text-gray-900">
                  {formatDateTime(booking.end_datetime)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">
              การรับสินค้า
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-gray-500">วิธีรับสินค้า</p>
                <p className="mt-1 font-medium text-gray-900">
                  {booking.fulfillment_method === "delivery"
                    ? "จัดส่ง"
                    : "มารับเอง"}
                </p>
              </div>

              {booking.fulfillment_method === "delivery" && (
                <div>
                  <p className="text-gray-500">
                    ที่อยู่จัดส่ง
                  </p>

                  <p className="mt-1 whitespace-pre-line font-medium text-gray-900">
                    {booking.delivery_address || "-"}
                  </p>
                </div>
              )}

              <div>
                <p className="text-gray-500">หมายเหตุ</p>

                <p className="mt-1 whitespace-pre-line font-medium text-gray-900">
                  {booking.customer_note || "-"}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">
              การชำระเงิน
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  ค่าเช่า
                </span>

                <span>
                  {Number(
                    booking.rental_amount
                  ).toLocaleString()}{" "}
                  บาท
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  ค่ามัดจำ
                </span>

                <span>
                  {Number(
                    booking.deposit_amount
                  ).toLocaleString()}{" "}
                  บาท
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold">
                <span>ยอดรวม</span>

                <span>
                  {Number(
                    booking.grand_total
                  ).toLocaleString()}{" "}
                  บาท
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-gray-500">
                  สถานะเงินมัดจำ
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {getDepositLabel(
                    booking.deposit_status
                  )}
                </p>
              </div>

              {booking.deposit_refunded_at && (
                <div>
                  <p className="text-gray-500">
                    คืนมัดจำเมื่อ
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {formatDateTime(
                      booking.deposit_refunded_at
                    )}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <p className="text-gray-500">
                  ชำระเมื่อ
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatDateTime(booking.paid_at)}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  เลขอ้างอิงการชำระเงิน
                </p>

                <p className="mt-1 break-all font-medium text-gray-900">
                  {booking.payment_reference || "-"}
                </p>
              </div>
            </div>
          </section>

          <StatusActions
            bookingNumber={booking.booking_number}
            bookingStatus={booking.booking_status}
            paymentStatus={booking.payment_status}
          />

          <DepositActions
            bookingNumber={booking.booking_number}
            bookingStatus={booking.booking_status}
            depositStatus={booking.deposit_status}
          />

          <p className="mt-6 text-xs text-gray-400">
            สร้างรายการเมื่อ{" "}
            {formatDateTime(booking.created_at)}
          </p>
        </div>
      </div>
    </main>
  );
}