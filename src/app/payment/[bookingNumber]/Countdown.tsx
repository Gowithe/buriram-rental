"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CountdownProps = {
  expiresAt: string;
};

export default function Countdown({
  expiresAt,
}: CountdownProps) {
  const router = useRouter();

  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    null
  );

  useEffect(() => {
    function updateCountdown() {
      const remaining =
        new Date(expiresAt).getTime() - Date.now();

      const seconds = Math.max(
        0,
        Math.floor(remaining / 1000)
      );

      setSecondsLeft(seconds);

      if (seconds <= 0) {
        router.refresh();
      }
    }

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, router]);

  if (secondsLeft === null) {
    return (
      <div className="mt-4">
        <p className="text-xs font-semibold text-orange-700">
          เวลาที่เหลือ
        </p>

        <div className="mt-2 flex justify-center">
          <div className="rounded-2xl border border-orange-200 bg-white px-6 py-3">
            <span className="text-3xl font-black tabular-nums text-orange-700">
              --:--
            </span>
          </div>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;

  if (secondsLeft <= 0) {
    return (
      <div className="mt-4">
        <p className="text-xs font-semibold text-red-700">
          เวลาที่เหลือ
        </p>

        <div className="mt-2 flex justify-center">
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-3">
            <span className="text-3xl font-black tabular-nums text-red-600">
              00:00
            </span>
          </div>
        </div>
      </div>
    );
  }

  const urgent = secondsLeft <= 5 * 60;

  return (
    <div className="mt-4">
      <p
        className={`text-xs font-semibold ${
          urgent ? "text-red-700" : "text-orange-700"
        }`}
      >
        เวลาที่เหลือ
      </p>

      <div className="mt-2 flex justify-center">
        <div
          className={`rounded-2xl border bg-white px-6 py-3 ${
            urgent
              ? "border-red-200"
              : "border-orange-200"
          }`}
        >
          <span
            className={`text-3xl font-black tabular-nums ${
              urgent
                ? "text-red-600"
                : "text-orange-700"
            }`}
          >
            {formattedTime}
          </span>
        </div>
      </div>

      {urgent && (
        <p className="mt-2 text-xs font-medium text-red-600">
          เหลือเวลาน้อยกว่า 5 นาที
        </p>
      )}
    </div>
  );
}