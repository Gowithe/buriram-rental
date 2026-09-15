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
        `ช่วงเวลานี้ว่าง เหลือ ${units} เครื่อง`
      );
    } else {
      setAvailabilityMessage(
        "ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกวันหรือเวลาอื่น"
      );
    }

    setChecking(false);
  }

  function packageClass(days: number) {
    const selected =
      calculation.valid && calculation.rentalDays === days;

    return selected
      ? "relative rounded-2xl border-2 border-red-600 bg-red-50 p-4 text-center shadow-sm"
      : "relative rounded-2xl border border-gray-200 bg-white p-4 text-center transition hover:border-gray-300";
  }

  function longPackageClass() {
    const selected =
      calculation.valid && calculation.rentalDays >= 6;

    return selected
      ? "relative rounded-2xl border-2 border-red-600 bg-red-50 p-4 text-center shadow-sm"
      : "relative rounded-2xl border border-gray-200 bg-white p-4 text-center transition hover:border-gray-300";
  }

  return (
    <>
      {/* CALENDAR */}
      <AvailabilityCalendar
        productId={productId}
        selectedDate={selectedCalendarDate}
        onSelectDate={handleCalendarSelect}
      />

      {/* DATE & TIME */}
      <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <p className="text-[11px] font-black uppercase tracking-wide text-red-600">
            วันและเวลา
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-900">
            กำหนดเวลารับและคืนสินค้า
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            เมื่อเลือกวันจากปฏิทิน ระบบจะตั้งเวลารับเริ่มต้นเป็น
            18:00 น. และกำหนดวันคืนให้ 24 ชั่วโมงโดยอัตโนมัติ
            คุณสามารถเปลี่ยนเวลาได้
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              รับสินค้า
            </label>

            <input
              type="datetime-local"
              value={startDate}
              onChange={(event) =>
                handleStartDateChange(event.target.value)
              }
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            <p className="mt-2 text-[11px] text-gray-500">
              เลือกวันและเวลาที่ต้องการรับเครื่อง
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              คืนสินค้า
            </label>

            <input
              type="datetime-local"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                resetAvailability();
              }}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            <p className="mt-2 text-[11px] text-gray-500">
              เกิน 24 ชั่วโมงจะนับเป็นวันเช่าถัดไป
            </p>
          </div>
        </div>

        {startDate && endDate && !calculation.valid && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            วันที่คืนสินค้าต้องอยู่หลังวันที่รับสินค้า
          </div>
        )}
      </section>

      {/* PACKAGE */}
      <section className="mt-6 rounded-3xl border border-gray-200 bg-[#f7f6f4] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-red-600">
              ราคาเช่า
            </p>

            <h3 className="mt-1 text-lg font-bold text-gray-900">
              แพ็กเกจตามจำนวนวัน
            </h3>
          </div>

          {calculation.valid && (
            <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
              {calculation.rentalDays} วัน
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className={packageClass(1)}>
            <p className="text-xs font-semibold text-gray-500">
              1 วัน
            </p>

            <p className="mt-2 text-xl font-black text-gray-900">
              399
              <span className="ml-1 text-[10px] font-medium text-gray-500">
                บาท
              </span>
            </p>
          </div>

          <div className={packageClass(2)}>
            <p className="text-xs font-semibold text-gray-500">
              2 วัน
            </p>

            <p className="mt-2 text-xl font-black text-gray-900">
              699
              <span className="ml-1 text-[10px] font-medium text-gray-500">
                บาท
              </span>
            </p>
          </div>

          <div className={packageClass(3)}>
            <div className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[8px] font-bold text-white">
              คุ้ม
            </div>

            <p className="text-xs font-semibold text-gray-500">
              3 วัน
            </p>

            <p className="mt-2 text-xl font-black text-gray-900">
              899
              <span className="ml-1 text-[10px] font-medium text-gray-500">
                บาท
              </span>
            </p>
          </div>

          <div className={packageClass(4)}>
            <p className="text-xs font-semibold text-gray-500">
              4 วัน
            </p>

            <p className="mt-2 text-xl font-black text-gray-900">
              1,099
              <span className="ml-1 text-[10px] font-medium text-gray-500">
                บาท
              </span>
            </p>
          </div>

          <div className={packageClass(5)}>
            <p className="text-xs font-semibold text-gray-500">
              5 วัน
            </p>

            <p className="mt-2 text-xl font-black text-gray-900">
              1,299
              <span className="ml-1 text-[10px] font-medium text-gray-500">
                บาท
              </span>
            </p>
          </div>

          <div className={longPackageClass()}>
            <p className="text-xs font-semibold text-gray-500">
              6 วันขึ้นไป
            </p>

            <p className="mt-2 text-base font-black text-gray-900">
              +200
              <span className="ml-1 text-[10px] font-medium text-gray-500">
                บาท/วัน
              </span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          เงินประกัน{" "}
          <strong className="text-gray-800">
            {depositAmount.toLocaleString()} บาท
          </strong>{" "}
          แยกจากค่าเช่า
        </p>
      </section>

      {/* COST SUMMARY */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <h3 className="font-bold text-gray-900">
            สรุปค่าใช้จ่ายเบื้องต้น
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            ยังไม่รวมค่าจัดส่ง หากเลือกบริการจัดส่ง
          </p>
        </div>

        <div className="space-y-3 px-5 py-5 text-sm sm:px-6">
          <div className="flex justify-between gap-4 text-gray-600">
            <span>
              ค่าเช่า
              {calculation.valid && (
                <small className="ml-1 text-gray-400">
                  ({calculation.rentalDays} วัน)
                </small>
              )}
            </span>

            <strong className="text-gray-900">
              {calculation.valid
                ? `${calculation.rentalAmount.toLocaleString()} บาท`
                : "—"}
            </strong>
          </div>

          <div className="flex justify-between gap-4 text-gray-600">
            <span>เงินประกัน</span>

            <strong className="text-gray-900">
              {depositAmount.toLocaleString()} บาท
            </strong>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-end justify-between gap-4">
              <strong className="text-gray-900">
                รวมเบื้องต้น
              </strong>

              <div className="text-right">
                {calculation.valid ? (
                  <>
                    <strong className="text-2xl font-black text-red-600">
                      {calculation.totalAmount.toLocaleString()}
                    </strong>

                    <span className="ml-1 text-xs font-bold">
                      บาท
                    </span>
                  </>
                ) : (
                  <strong className="text-xl text-gray-400">
                    —
                  </strong>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHECK AVAILABILITY */}
      <button
        type="button"
        onClick={checkAvailability}
        disabled={!calculation.valid || checking}
        className="mt-6 flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
      >
        {checking
          ? "กำลังตรวจสอบคิว..."
          : "ตรวจสอบวันว่าง →"}
      </button>

      {!calculation.valid && (
        <p className="mt-3 text-center text-xs text-gray-500">
          กรุณาเลือกวันรับและวันคืนก่อนตรวจสอบคิว
        </p>
      )}

      {/* AVAILABILITY RESULT */}
      {availabilityMessage && (
        <div
          className={`mt-5 rounded-2xl border p-5 ${
            availableUnits !== null && availableUnits > 0
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex gap-3">
            <div
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black text-white ${
                availableUnits !== null && availableUnits > 0
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {availableUnits !== null && availableUnits > 0
                ? "✓"
                : "!"}
            </div>

            <div>
              <strong
                className={
                  availableUnits !== null && availableUnits > 0
                    ? "text-green-900"
                    : "text-red-900"
                }
              >
                {availableUnits !== null && availableUnits > 0
                  ? "ช่วงเวลานี้จองได้"
                  : "ช่วงเวลานี้ไม่ว่าง"}
              </strong>

              <p
                className={`mt-1 text-sm ${
                  availableUnits !== null && availableUnits > 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {availabilityMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER FORM */}
      {availableUnits !== null &&
        availableUnits > 0 &&
        calculation.valid && (
          <div className="mt-7 border-t border-gray-200 pt-7">
            <div className="mb-4">
              <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-700">
                ขั้นตอนที่ 3
              </span>

              <h2 className="mt-3 text-xl font-bold text-gray-900">
                ข้อมูลสำหรับการจอง
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                ช่วงเวลาที่เลือกยังว่าง
                กรอกข้อมูลด้านล่างเพื่อดำเนินการต่อ
              </p>
            </div>

            <CustomerForm
              productId={productId}
              productName={productName}
              startDate={startDate}
              endDate={endDate}
              rentalAmount={calculation.rentalAmount}
              depositAmount={depositAmount}
              totalAmount={calculation.totalAmount}
            />
          </div>
        )}
    </>
  );
}