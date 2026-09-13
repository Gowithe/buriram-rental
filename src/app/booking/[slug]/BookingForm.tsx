"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CustomerForm from "./CustomerForm";
import AvailabilityCalendar from "./AvailabilityCalendar";

type BookingFormProps = {
  productId: number;
  productName: string;
  dailyPrice: number;
  depositAmount: number;
};

export default function BookingForm({
  productId,
  productName,
  dailyPrice,
  depositAmount,
}: BookingFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [checking, setChecking] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availableUnits, setAvailableUnits] = useState<number | null>(null);

  const selectedCalendarDate = startDate ? startDate.slice(0, 10) : "";

  const calculation = useMemo(() => {
    if (!startDate || !endDate) {
      return {
        hours: 0,
        rentalDays: 0,
        rentalAmount: 0,
        totalAmount: 0,
        valid: false,
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const differenceMs = end.getTime() - start.getTime();

    if (differenceMs <= 0) {
      return {
        hours: 0,
        rentalDays: 0,
        rentalAmount: 0,
        totalAmount: 0,
        valid: false,
      };
    }

    const hours = differenceMs / (1000 * 60 * 60);
    const rentalDays = Math.ceil(hours / 24);

    let rentalAmount = 0;

    if (rentalDays === 1) {
      rentalAmount = 399;
    } else if (rentalDays === 2) {
      rentalAmount = 699;
    } else if (rentalDays === 3) {
      rentalAmount = 899;
    } else {
      rentalAmount = 899 + (rentalDays - 3) * 200;
    }

    const totalAmount = rentalAmount + depositAmount;

    return {
      hours,
      rentalDays,
      rentalAmount,
      totalAmount,
      valid: true,
    };
  }, [startDate, endDate, dailyPrice, depositAmount]);

  function resetAvailability() {
    setAvailabilityMessage("");
    setAvailableUnits(null);
  }

  function formatDateTimeLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  function setDefaultReturnDate(startValue: string) {
    if (!startValue) {
      setEndDate("");
      return;
    }

    const start = new Date(startValue);

    const returnDate = new Date(
      start.getTime() + 24 * 60 * 60 * 1000
    );

    setEndDate(formatDateTimeLocal(returnDate));
  }

  function handleCalendarSelect(date: string) {
    const currentTime =
      startDate && startDate.includes("T")
        ? startDate.split("T")[1]
        : "18:00";

    const newStartDate = `${date}T${currentTime}`;

    setStartDate(newStartDate);
    setDefaultReturnDate(newStartDate);

    resetAvailability();
  }

  function handleStartDateChange(value: string) {
    setStartDate(value);
    setDefaultReturnDate(value);

    resetAvailability();
  }

  async function checkAvailability() {
    if (!calculation.valid || !startDate || !endDate) {
      return;
    }

    setChecking(true);
    resetAvailability();

    const supabase = createClient();

    const { data, error } = await supabase.rpc(
      "check_product_availability",
      {
        p_product_id: productId,
        p_start_datetime: new Date(startDate).toISOString(),
        p_end_datetime: new Date(endDate).toISOString(),
      }
    );

    if (error) {
      console.error(error);

      setAvailabilityMessage(
        "เกิดข้อผิดพลาดในการตรวจสอบวันว่าง"
      );

      setChecking(false);
      return;
    }

    const result = data?.[0];

    if (!result) {
      setAvailabilityMessage(
        "ไม่พบข้อมูลสินค้าสำหรับช่วงเวลานี้"
      );

      setChecking(false);
      return;
    }

    const units = Number(result.available_units);

    setAvailableUnits(units);

    if (units > 0) {
      setAvailabilityMessage(
        `✅ ช่วงเวลานี้ว่าง เหลือ ${units} เครื่อง`
      );
    } else {
      setAvailabilityMessage(
        "❌ ช่วงเวลานี้ถูกจองเต็มแล้ว กรุณาเลือกวันหรือเวลาอื่น"
      );
    }

    setChecking(false);
  }

  function packageClass(days: number) {
    const selected =
      calculation.valid && calculation.rentalDays === days;

    return selected
      ? "rounded-xl border-2 border-green-600 bg-green-100 p-3 text-center shadow-sm"
      : "rounded-xl border border-transparent bg-white p-3 text-center";
  }

  function longPackageClass() {
    const selected =
      calculation.valid && calculation.rentalDays >= 6;

    return selected
      ? "rounded-xl border-2 border-green-600 bg-green-100 p-3 text-center shadow-sm"
      : "rounded-xl border border-transparent bg-white p-3 text-center";
  }

  return (
    <>
      <div className="mt-6">
        <AvailabilityCalendar
          productId={productId}
          selectedDate={selectedCalendarDate}
          onSelectDate={handleCalendarSelect}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            วันที่รับสินค้า
          </label>

          <input
            type="datetime-local"
            value={startDate}
            onChange={(event) =>
              handleStartDateChange(event.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
          />

          <p className="mt-2 text-xs text-gray-500">
            เลือกวันจากปฏิทินด้านบน หรือแก้ไขวันและเวลาได้เอง
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            วันที่คืนสินค้า
          </label>

          <input
            type="datetime-local"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              resetAvailability();
            }}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
          />

          <p className="mt-2 text-xs text-gray-500">
            ระบบตั้งค่าเริ่มต้นให้ 24 ชั่วโมงหลังวันรับสินค้า
          </p>
        </div>
      </div>

      {startDate && endDate && !calculation.valid && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          วันที่คืนสินค้าต้องอยู่หลังวันที่รับสินค้า
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-green-900">
            แพ็กเกจค่าเช่า
          </p>

          {calculation.valid && (
            <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-medium text-white">
              เลือก {calculation.rentalDays} วัน
            </span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className={packageClass(1)}>
            <p className="text-gray-500">
              1 วัน
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              399 บาท
            </p>
          </div>

          <div className={packageClass(2)}>
            <p className="text-gray-500">
              2 วัน
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              699 บาท
            </p>
          </div>

          <div className={packageClass(3)}>
            <p className="text-gray-500">
              3 วัน
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              899 บาท
            </p>
          </div>

          <div className={packageClass(4)}>
            <p className="text-gray-500">
              4 วัน
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              1,099 บาท
            </p>
          </div>

          <div className={packageClass(5)}>
            <p className="text-gray-500">
              5 วัน
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              1,299 บาท
            </p>
          </div>

          <div className={longPackageClass()}>
            <p className="text-gray-500">
              6 วันขึ้นไป
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              +200 บาท/วัน
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-green-800">
          ยิ่งเช่าหลายวัน ยิ่งประหยัด ค่ามัดจำ{" "}
          {depositAmount.toLocaleString()} บาท แยกจากค่าเช่า
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 p-4">
        <p className="font-medium text-gray-900">
          สรุปค่าใช้จ่าย
        </p>

        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>
              ค่าเช่า
              {calculation.valid && (
                <span className="ml-1 text-gray-400">
                  ({calculation.rentalDays} วัน)
                </span>
              )}
            </span>

            <span>
              {calculation.valid
                ? `${calculation.rentalAmount.toLocaleString()} บาท`
                : "- บาท"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>
              ค่ามัดจำ
            </span>

            <span>
              {depositAmount.toLocaleString()} บาท
            </span>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex justify-between font-semibold text-gray-900">
              <span>
                รวมทั้งหมด
              </span>

              <span>
                {calculation.valid
                  ? `${calculation.totalAmount.toLocaleString()} บาท`
                  : "- บาท"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={checkAvailability}
        disabled={!calculation.valid || checking}
        className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {checking
          ? "กำลังตรวจสอบ..."
          : "ตรวจสอบวันว่าง"}
      </button>

      {availabilityMessage && (
        <div
          className={`mt-4 rounded-xl p-4 text-sm ${
            availableUnits !== null && availableUnits > 0
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {availabilityMessage}
        </div>
      )}

      {availableUnits !== null &&
        availableUnits > 0 &&
        calculation.valid && (
          <CustomerForm
            productId={productId}
            productName={productName}
            startDate={startDate}
            endDate={endDate}
            rentalAmount={calculation.rentalAmount}
            depositAmount={depositAmount}
            totalAmount={calculation.totalAmount}
          />
        )}
    </>
  );
}