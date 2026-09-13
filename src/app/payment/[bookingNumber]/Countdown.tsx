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

    // คำนวณหลัง component mount เท่านั้น
    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, router]);

  // ป้องกัน hydration mismatch
  if (secondsLeft === null) {
    return (
      <div className="mt-3 text-center">
        <p className="text-xs text-orange-700">
          เวลาที่เหลือ
        </p>

        <p className="mt-1 text-2xl font-bold text-orange-700">
          --:--
        </p>
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
      <div className="mt-3 text-center">
        <p className="text-xs text-red-600">
          เวลาที่เหลือ
        </p>

        <p className="mt-1 text-2xl font-bold text-red-600">
          00:00
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 text-center">
      <p className="text-xs text-orange-700">
        เวลาที่เหลือ
      </p>

      <p className="mt-1 text-2xl font-bold text-orange-700">
        {formattedTime}
      </p>
    </div>
  );
}