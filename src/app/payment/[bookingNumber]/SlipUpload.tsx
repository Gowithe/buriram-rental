"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SlipUploadProps = {
  bookingNumber: string;
};

export default function SlipUpload({
  bookingNumber,
}: SlipUploadProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    setMessage("");
    setSuccess(false);
  }

  async function handleVerifySlip() {
    if (!file) {
      setMessage("กรุณาเลือกรูปสลิป");
      setSuccess(false);
      return;
    }

    setSubmitting(true);
    setMessage("");
    setSuccess(false);

    try {
      const formData = new FormData();

      formData.append("slip", file);
      formData.append("bookingNumber", bookingNumber);

      const response = await fetch(
        "/api/payment/verify-slip",
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);

        setMessage(
          "ระบบตรวจสอบสลิปตอบกลับไม่ถูกต้อง กรุณาลองใหม่"
        );
        setSuccess(false);
        return;
      }

      if (!response.ok || !result.success) {
        setMessage(
          result.message || "ตรวจสอบสลิปไม่สำเร็จ"
        );
        setSuccess(false);
        return;
      }

      setMessage(
        result.message ||
          "ชำระเงินสำเร็จ การจองได้รับการยืนยันแล้ว"
      );

      setSuccess(true);

      // โหลดข้อมูล Booking ใหม่จาก Server
      router.refresh();
    } catch (error) {
      console.error("Verify slip error:", error);

      setMessage(
        "เกิดข้อผิดพลาดในการเชื่อมต่อระบบตรวจสอบสลิป"
      );

      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-6">
      <p className="text-center font-semibold text-gray-900">
        โอนเงินเรียบร้อยแล้ว?
      </p>

      <p className="mt-2 text-center text-sm text-gray-500">
        อัปโหลดสลิปเพื่อยืนยันการชำระเงิน
      </p>

      <label className="mt-5 block cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-4 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
        เลือกรูปสลิป

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {file && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-medium">
            เลือกไฟล์แล้ว
          </p>

          <p className="mt-1 break-all">
            {file.name}
          </p>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 rounded-xl p-4 text-sm ${
            success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={handleVerifySlip}
        disabled={!file || submitting}
        className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {submitting
          ? "กำลังตรวจสอบสลิป..."
          : "ตรวจสอบสลิป"}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        รองรับ JPG, PNG, WebP และ GIF ขนาดไม่เกิน 4 MB
      </p>
    </div>
  );
}