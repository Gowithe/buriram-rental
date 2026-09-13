"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  bookingNumber: string;
  bookingStatus: string;
  depositStatus: string;
};

export default function DepositActions({
  bookingNumber,
  bookingStatus,
  depositStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function refundDeposit() {
    const confirmed = window.confirm(
      "ยืนยันว่าคืนเงินมัดจำให้ลูกค้าเรียบร้อยแล้ว?"
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "refund_admin_booking_deposit",
        {
          p_booking_number: bookingNumber,
        }
      );

      if (error) {
        console.error(error);
        setMessage("ไม่สามารถอัปเดตสถานะเงินมัดจำได้");
        return;
      }

      setMessage("บันทึกการคืนเงินมัดจำเรียบร้อยแล้ว");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  if (depositStatus === "refunded") {
    return (
      <div className="mt-6 rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-700">
        ✓ คืนเงินมัดจำเรียบร้อยแล้ว
      </div>
    );
  }

  if (bookingStatus === "returned") {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={refundDeposit}
          disabled={loading}
          className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          {loading
            ? "กำลังบันทึก..."
            : "ยืนยันว่าคืนเงินมัดจำแล้ว"}
        </button>

        {message && (
          <p className="mt-3 text-center text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    );
  }

  return null;
}