"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      router.push("/admin/bookings");
      router.refresh();
    } catch (error) {
      console.error("Admin login error:", error);

      setErrorMessage(
        "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            BURIRAM RENTAL
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            เข้าสู่ระบบหลังบ้าน
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            สำหรับผู้ดูแลระบบ
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-7 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                อีเมล
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                รหัสผ่าน
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading
                ? "กำลังเข้าสู่ระบบ..."
                : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          BURIRAM RENTAL ADMIN
        </p>
      </div>
    </main>
  );
}