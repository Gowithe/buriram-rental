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
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
        <p className="text-[11px] font-black uppercase tracking-wide text-red-600">
          PAYMENT VERIFICATION
        </p>

        <h2 className="mt-2 text-xl font-black text-gray-900">
          โอนเงินแล้ว อัปโหลดสลิปที่นี่
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          ระบบจะตรวจสอบข้อมูลการชำระเงิน
          และยืนยันรายการจองหลังตรวจสอบสำเร็จ
        </p>
      </div>

      <div className="p-5 sm:p-7">
        {/* UPLOAD AREA */}
        <label className="group block cursor-pointer rounded-3xl border-2 border-dashed border-gray-300 bg-[#fafafa] px-5 py-8 text-center transition hover:border-red-300 hover:bg-red-50/30">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-xl">
            ↑
          </div>

          <p className="mt-4 font-bold text-gray-900">
            {file
              ? "เปลี่ยนรูปสลิป"
              : "เลือกรูปสลิป"}
          </p>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            แตะเพื่อเลือกรูปจากโทรศัพท์หรือคอมพิวเตอร์
          </p>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* SELECTED FILE */}
        {file && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green-600 text-xs font-black text-white">
                ✓
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-green-900">
                  เลือกไฟล์แล้ว
                </p>

                <p className="mt-1 break-all text-sm text-green-700">
                  {file.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGE */}
        {message && (
          <div
            className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${
              success
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black text-white ${
                  success
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {success ? "✓" : "!"}
              </div>

              <p>{message}</p>
            </div>
          </div>
        )}

        {/* VERIFY BUTTON */}
        <button
          type="button"
          onClick={handleVerifySlip}
          disabled={!file || submitting}
          className="mt-5 flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          {submitting
            ? "กำลังตรวจสอบสลิป..."
            : "ตรวจสอบสลิปและยืนยันการจอง →"}
        </button>

        {!file && (
          <p className="mt-3 text-center text-xs text-gray-400">
            กรุณาเลือกรูปสลิปก่อนตรวจสอบ
          </p>
        )}

        {/* INFO */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-800">
              ไฟล์ที่รองรับ
            </p>

            <p className="mt-1 text-[11px] leading-5 text-gray-500">
              JPG, PNG, WebP และ GIF
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-800">
              ขนาดไฟล์
            </p>

            <p className="mt-1 text-[11px] leading-5 text-gray-500">
              ไม่เกิน 4 MB
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 p-4 text-[11px] leading-5 text-gray-500">
          <strong className="text-gray-800">
            ก่อนอัปโหลด
          </strong>

          <p className="mt-1">
            กรุณาตรวจสอบว่ายอดเงินในสลิปตรงกับยอดที่แสดงบนหน้าชำระเงิน
          </p>
        </div>
      </div>
    </section>
  );
}