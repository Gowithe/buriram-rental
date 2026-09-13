"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  bookingNumber: string;
  bookingStatus: string;
  paymentStatus: string;
};

export default function StatusActions({
  bookingNumber,
  bookingStatus,
  paymentStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus(newStatus: "picked_up" | "returned") {
    const confirmMessage =
      newStatus === "picked_up"
        ? "ยืนยันว่าลูกค้ารับเครื่องแล้ว?"
        : "ยืนยันว่าได้รับเครื่องคืนแล้ว?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "update_admin_booking_status",
        {
          p_booking_number: bookingNumber,
          p_new_status: newStatus,
        }
      );

      if (error) {
        console.error(error);
        setMessage("ไม่สามารถเปลี่ยนสถานะได้");
        return;
      }

      setMessage("อัปเดตสถานะเรียบร้อยแล้ว");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  if (
    bookingStatus === "confirmed" &&
    paymentStatus === "paid"
  ) {
    return (
      <div className="mt-6">
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("picked_up")}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          {loading
            ? "กำลังอัปเดต..."
            : "ยืนยันว่าลูกค้ารับเครื่องแล้ว"}
        </button>

        {message && (
          <p className="mt-3 text-center text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    );
  }

  if (bookingStatus === "picked_up") {
    return (
      <div className="mt-6">
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("returned")}
          className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          {loading
            ? "กำลังอัปเดต..."
            : "ยืนยันว่าได้รับเครื่องคืนแล้ว"}
        </button>

        {message && (
          <p className="mt-3 text-center text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    );
  }

  if (bookingStatus === "returned") {
    return (
      <div className="mt-6 rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-700">
        ✓ การเช่านี้เสร็จสิ้นแล้ว
      </div>
    );
  }

  return null;
}