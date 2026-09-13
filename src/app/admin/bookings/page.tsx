import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "../LogoutButton";

function formatDateTime(value: string) {
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

function getFulfillmentLabel(method: string | null) {
  return method === "delivery" ? "จัดส่ง" : "มารับเอง";
}

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const { data, error } = await supabase.rpc(
    "get_admin_bookings"
  );

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-orange-600">
                  BURIRAM RENTAL
                </p>

                <h1 className="mt-2 text-2xl font-bold text-gray-900">
                  รายการจอง
                </h1>
              </div>

              <LogoutButton />
            </div>

            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              ไม่สามารถโหลดรายการจองได้: {error.message}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const bookings = data ?? [];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                BURIRAM RENTAL
              </p>

              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                รายการจอง
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                ดูรายการจองและสถานะการชำระเงิน
              </p>
            </div>

            <LogoutButton />
          </div>

          <div className="mt-5 flex justify-end">
            <div className="rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-600">
              ทั้งหมด {bookings.length} รายการ
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-semibold text-gray-900">
                ยังไม่มีรายการจอง
              </p>

              <p className="mt-2 text-sm text-gray-500">
                เมื่อมีลูกค้าจอง รายการจะแสดงที่นี่
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {bookings.map((booking: any) => {
                const paid =
                  booking.payment_status === "paid";

                return (
                  <div
                    key={booking.booking_id}
                    className="rounded-2xl border border-gray-200 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs text-gray-500">
                          เลขที่การจอง
                        </p>

                        <p className="mt-1 font-bold text-gray-900">
                          {booking.booking_number}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            paid
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {getPaymentLabel(
                            booking.payment_status
                          )}
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {getStatusLabel(
                            booking.booking_status
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-gray-500">
                          ลูกค้า
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                          {booking.customer_name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {booking.customer_phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          สินค้า
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                          {booking.product_name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {getFulfillmentLabel(
                            booking.fulfillment_method
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                        <span className="text-gray-500">
                          วันรับ
                        </span>

                        <span className="font-medium text-gray-900">
                          {formatDateTime(
                            booking.start_datetime
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:justify-between">
                        <span className="text-gray-500">
                          วันคืน
                        </span>

                        <span className="font-medium text-gray-900">
                          {formatDateTime(
                            booking.end_datetime
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between border-t border-gray-200 pt-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          สร้างรายการเมื่อ
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {formatDateTime(
                            booking.created_at
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          ยอดรวม
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-900">
                          {Number(
                            booking.grand_total
                          ).toLocaleString()}{" "}
                          บาท
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/bookings/${booking.booking_number}`}
                      className="mt-5 block w-full rounded-xl bg-gray-900 px-4 py-3 text-center font-medium text-white hover:bg-gray-800"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}