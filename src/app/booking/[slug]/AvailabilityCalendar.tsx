"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CalendarDay = {
  availability_date: string;
  status: "available" | "booked" | "past";
};

type Props = {
  productId: number;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
};

const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const weekDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export default function AvailabilityCalendar({
  productId,
  selectedDate,
  onSelectDate,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  });

  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const monthStart = useMemo(() => {
    const year = currentMonth.getFullYear();

    const month = String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}-01`;
  }, [currentMonth]);

  useEffect(() => {
    async function loadCalendar() {
      setLoading(true);
      setErrorMessage("");

      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "get_product_calendar_availability",
        {
          p_product_id: productId,
          p_month_start: monthStart,
        }
      );

      if (error) {
        console.error(error);

        setErrorMessage(error.message);
        setDays([]);
      } else {
        setDays(data ?? []);
      }

      setLoading(false);
    }

    loadCalendar();
  }, [productId, monthStart]);

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  function previousMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  }

  const currentMonthLabel = `${
    thaiMonths[currentMonth.getMonth()]
  } ${currentMonth.getFullYear() + 543}`;

  function getDayStyle(day: CalendarDay) {
    const isSelected =
      selectedDate === day.availability_date;

    if (isSelected && day.status === "available") {
      return "border-green-700 bg-green-600 text-white ring-2 ring-green-200";
    }

    switch (day.status) {
      case "available":
        return "cursor-pointer border-green-200 bg-green-50 text-green-700 hover:bg-green-100";

      case "booked":
        return "cursor-not-allowed border-red-200 bg-red-50 text-red-700";

      case "past":
        return "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400";

      default:
        return "border-gray-200 bg-white text-gray-700";
    }
  }

  function selectDay(day: CalendarDay) {
    if (day.status !== "available") {
      return;
    }

    onSelectDate?.(day.availability_date);
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={previousMonth}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ←
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            ตารางวันว่าง
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900">
            {currentMonthLabel}
          </h2>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          →
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-1 text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}

        {Array.from({
          length: firstDayOfMonth,
        }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {days.map((day) => {
          const dayNumber = Number(
            day.availability_date.split("-")[2]
          );

          return (
            <button
              type="button"
              key={day.availability_date}
              disabled={day.status !== "available"}
              onClick={() => selectDay(day)}
              className={`flex aspect-square items-center justify-center rounded-xl border text-sm font-semibold transition ${getDayStyle(
                day
              )}`}
              title={
                day.status === "available"
                  ? "กดเพื่อเลือกวันนี้"
                  : day.status === "booked"
                  ? "มีการจองแล้ว"
                  : "วันที่ผ่านมาแล้ว"
              }
            >
              {dayNumber}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="mt-4 text-center text-sm text-gray-500">
          กำลังโหลดตาราง...
        </p>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          โหลดตารางไม่สำเร็จ: {errorMessage}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          ว่าง
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          มีการจองแล้ว
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-300" />
          วันที่ผ่านมา
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        * กดวันที่สีเขียวเพื่อเลือกวันรับสินค้า
        ระบบจะตรวจสอบวันและเวลาอีกครั้งก่อนยืนยันการจอง
      </p>
    </section>
  );
}