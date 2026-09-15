"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GooglePlaceAutocomplete from "./GooglePlaceAutocomplete";

type CustomerFormProps = {
  productId: number;
  productName: string;
  startDate: string;
  endDate: string;
  rentalAmount: number;
  depositAmount: number;
  totalAmount: number;
};

export default function CustomerForm({
  productId,
  productName,
  startDate,
  endDate,
  rentalAmount,
  depositAmount,
  totalAmount,
}: CustomerFormProps) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [lineContact, setLineContact] = useState("");

  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<"pickup" | "delivery">("pickup");

  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [deliveryLatitude, setDeliveryLatitude] =
    useState<number | null>(null);

  const [deliveryLongitude, setDeliveryLongitude] =
    useState<number | null>(null);

  const [deliveryDistanceKm, setDeliveryDistanceKm] =
    useState<number | null>(null);

  const [deliveryFee, setDeliveryFee] =
    useState<number | null>(null);

  const [contactRequired, setContactRequired] =
    useState(false);

  const [calculatingDelivery, setCalculatingDelivery] =
    useState(false);

  const [deliveryError, setDeliveryError] = useState("");

  const [customerNote, setCustomerNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const finalTotal =
    fulfillmentMethod === "delivery" && deliveryFee !== null
      ? totalAmount + deliveryFee
      : totalAmount;

  function resetDelivery() {
    setDeliveryAddress("");
    setDeliveryLatitude(null);
    setDeliveryLongitude(null);
    setDeliveryDistanceKm(null);
    setDeliveryFee(null);
    setContactRequired(false);
    setDeliveryError("");
  }

  async function calculateDelivery(
    latitude: number,
    longitude: number
  ) {
    setCalculatingDelivery(true);
    setDeliveryError("");
    setDeliveryDistanceKm(null);
    setDeliveryFee(null);
    setContactRequired(false);

    try {
      const response = await fetch("/api/delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinationLat: latitude,
          destinationLng: longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setDeliveryError(
          "ไม่สามารถคำนวณระยะทางได้ กรุณาลองใหม่อีกครั้ง"
        );
        return;
      }

      setDeliveryDistanceKm(Number(data.distanceKm));
      setContactRequired(Boolean(data.contactRequired));

      if (data.deliveryFee !== null) {
        setDeliveryFee(Number(data.deliveryFee));
      }
    } catch (error) {
      console.error(error);

      setDeliveryError(
        "เกิดข้อผิดพลาดในการคำนวณค่าจัดส่ง"
      );
    } finally {
      setCalculatingDelivery(false);
    }
  }

  async function createPickupBooking() {
    const supabase = createClient();

    const { data, error } = await supabase.rpc(
      "create_booking",
      {
        p_product_id: productId,
        p_start_datetime: new Date(startDate).toISOString(),
        p_end_datetime: new Date(endDate).toISOString(),
        p_customer_name: customerName.trim(),
        p_phone: phone.trim(),
        p_line_contact: lineContact.trim() || null,
        p_fulfillment_method: "pickup",
        p_delivery_address: null,
        p_customer_note: customerNote.trim() || null,
      }
    );

    if (error) {
      throw error;
    }

    const booking = data?.[0];

    if (!booking?.booking_number) {
      throw new Error("BOOKING_NOT_RETURNED");
    }

    return booking.booking_number;
  }

  async function createDeliveryBooking() {
    if (
      deliveryLatitude === null ||
      deliveryLongitude === null
    ) {
      throw new Error("INVALID_DESTINATION");
    }

    const response = await fetch(
      "/api/booking/create-delivery",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          startDate,
          endDate,
          customerName: customerName.trim(),
          phone: phone.trim(),
          lineContact: lineContact.trim() || null,
          deliveryAddress,
          deliveryLatitude,
          deliveryLongitude,
          customerNote: customerNote.trim() || null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (
        data.message === "DELIVERY_DISTANCE_TOO_FAR"
      ) {
        throw new Error("DELIVERY_DISTANCE_TOO_FAR");
      }

      if (data.message === "PRODUCT_NOT_AVAILABLE") {
        throw new Error("PRODUCT_NOT_AVAILABLE");
      }

      throw new Error(
        data.message || "BOOKING_CREATION_FAILED"
      );
    }

    return data.bookingNumber;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!customerName.trim()) {
      setErrorMessage("กรุณากรอกชื่อผู้เช่า");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("กรุณากรอกเบอร์โทรศัพท์");
      return;
    }

    if (fulfillmentMethod === "delivery") {
      if (!deliveryAddress.trim()) {
        setErrorMessage(
          "กรุณาค้นหาและเลือกสถานที่สำหรับจัดส่ง"
        );
        return;
      }

      if (
        deliveryLatitude === null ||
        deliveryLongitude === null
      ) {
        setErrorMessage(
          "กรุณาเลือกสถานที่จากผลการค้นหา Google"
        );
        return;
      }

      if (calculatingDelivery) {
        setErrorMessage(
          "กรุณารอระบบคำนวณค่าจัดส่ง"
        );
        return;
      }

      if (contactRequired) {
        setErrorMessage(
          "ระยะทางเกิน 15 กม. กรุณาติดต่อร้านก่อนทำรายการจอง"
        );
        return;
      }

      if (deliveryFee === null) {
        setErrorMessage(
          "ยังไม่สามารถคำนวณค่าจัดส่งได้"
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      let bookingNumber = "";

      if (fulfillmentMethod === "pickup") {
        bookingNumber = await createPickupBooking();
      } else {
        bookingNumber = await createDeliveryBooking();
      }

      router.push(`/payment/${bookingNumber}`);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : "";

      if (message.includes("PRODUCT_NOT_AVAILABLE")) {
        setErrorMessage(
          "ช่วงเวลานี้ถูกจองไปแล้ว กรุณาเลือกวันหรือเวลาอื่น"
        );
      } else if (
        message.includes("DELIVERY_DISTANCE_TOO_FAR")
      ) {
        setErrorMessage(
          "ระยะทางเกิน 15 กม. กรุณาติดต่อร้านเพื่อประเมินค่าจัดส่ง"
        );
      } else {
        setErrorMessage(
          "เกิดข้อผิดพลาดในการสร้างรายการจอง กรุณาลองใหม่อีกครั้ง"
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
      {/* CUSTOMER INFO */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-wide text-red-600">
          ข้อมูลผู้เช่า
        </p>

        <h3 className="mt-1 text-lg font-bold text-gray-900">
          ข้อมูลสำหรับติดต่อ
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          ใช้สำหรับยืนยันรายการจองและติดต่อเรื่องการรับ-คืนสินค้า
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6"
      >
        {/* NAME / PHONE */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              ชื่อผู้เช่า <span className="text-red-600">*</span>
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
              placeholder="ชื่อ-นามสกุล"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              เบอร์โทรศัพท์ <span className="text-red-600">*</span>
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="เช่น 0812345678"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        {/* LINE */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-800">
            LINE ID / เบอร์ติดต่อ LINE
          </label>

          <input
            type="text"
            value={lineContact}
            onChange={(event) =>
              setLineContact(event.target.value)
            }
            placeholder="ไม่บังคับ"
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />

          <p className="mt-2 text-[11px] text-gray-500">
            ไม่จำเป็นต้องกรอก หากสะดวกติดต่อทางโทรศัพท์
          </p>
        </div>

        {/* FULFILLMENT */}
        <section className="border-t border-gray-200 pt-6">
          <p className="text-[11px] font-black uppercase tracking-wide text-red-600">
            วิธีรับสินค้า
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-900">
            ต้องการรับเครื่องแบบไหน?
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setFulfillmentMethod("pickup");
                resetDelivery();
                setErrorMessage("");
              }}
              className={`relative rounded-2xl border-2 p-5 text-left transition ${
                fulfillmentMethod === "pickup"
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {fulfillmentMethod === "pickup" && (
                <div className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-black text-white">
                  ✓
                </div>
              )}

              <div className="text-2xl">📦</div>

              <p className="mt-3 font-bold text-gray-900">
                รับสินค้าเอง
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                นัดหมายวันและเวลารับสินค้า
              </p>

              <p className="mt-3 text-sm font-black text-green-700">
                ไม่มีค่าจัดส่ง
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setFulfillmentMethod("delivery");
                setErrorMessage("");
              }}
              className={`relative rounded-2xl border-2 p-5 text-left transition ${
                fulfillmentMethod === "delivery"
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {fulfillmentMethod === "delivery" && (
                <div className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-black text-white">
                  ✓
                </div>
              )}

              <div className="text-2xl">🚚</div>

              <p className="mt-3 font-bold text-gray-900">
                จัดส่งถึงที่
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                ระบบคำนวณจากระยะทางตามถนน
              </p>

              <p className="mt-3 text-sm font-bold text-gray-800">
                เริ่มต้น 50 บาท
              </p>
            </button>
          </div>

          <div className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-[11px] leading-5 text-gray-500">
            ค่าจัดส่ง: 0–5 กม. 50 บาท • มากกว่า 5–10 กม.
            100 บาท • มากกว่า 10–15 กม. 150 บาท
          </div>
        </section>

        {/* DELIVERY */}
        {fulfillmentMethod === "delivery" && (
          <section className="rounded-3xl border border-red-100 bg-[#fffafa] p-5">
            <div>
              <p className="text-[11px] font-black text-red-600">
                สถานที่จัดส่ง
              </p>

              <h3 className="mt-1 font-bold text-gray-900">
                ค้นหาที่อยู่ของคุณ
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                เลือกสถานที่จากผลการค้นหา
                เพื่อให้ระบบคำนวณระยะทางตามถนนและค่าจัดส่ง
              </p>
            </div>

            <div className="mt-4">
              <GooglePlaceAutocomplete
                onPlaceSelected={async (place) => {
                  setDeliveryAddress(place.address);
                  setDeliveryLatitude(place.latitude);
                  setDeliveryLongitude(place.longitude);

                  await calculateDelivery(
                    place.latitude,
                    place.longitude
                  );
                }}
              />
            </div>

            {deliveryAddress && (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase text-gray-400">
                  ที่อยู่ที่เลือก
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-700">
                  {deliveryAddress}
                </p>
              </div>
            )}

            {calculatingDelivery && (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                กำลังคำนวณระยะทางและค่าจัดส่ง...
              </div>
            )}

            {deliveryError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {deliveryError}
              </div>
            )}

            {!calculatingDelivery &&
              deliveryDistanceKm !== null &&
              deliveryFee !== null &&
              !contactRequired && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 text-sm">
                    <span className="text-gray-500">
                      ระยะทางตามถนน
                    </span>

                    <strong className="text-gray-900">
                      {deliveryDistanceKm.toLocaleString()} กม.
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span className="text-gray-500">
                      ค่าจัดส่ง
                    </span>

                    <strong className="text-red-600">
                      {deliveryFee.toLocaleString()} บาท
                    </strong>
                  </div>
                </div>
              )}

            {contactRequired && (
              <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-800">
                ระยะทางเกิน 15 กม.
                กรุณาติดต่อร้านก่อนทำรายการจอง
                เพื่อประเมินค่าจัดส่ง
              </div>
            )}
          </section>
        )}

        {/* NOTE */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-800">
            หมายเหตุเพิ่มเติม
          </label>

          <textarea
            value={customerNote}
            onChange={(event) =>
              setCustomerNote(event.target.value)
            }
            rows={3}
            placeholder="เช่น รายละเอียดการนัดรับ หรือข้อมูลเพิ่มเติม (ไม่บังคับ)"
            className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </div>

        {/* SUMMARY */}
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-[#f7f6f4]">
          <div className="border-b border-gray-200 px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-wide text-red-600">
              สรุปรายการ
            </p>

            <h3 className="mt-1 font-bold text-gray-900">
              ยอดที่ต้องชำระ
            </h3>
          </div>

          <div className="space-y-3 px-5 py-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                ค่าเช่า
              </span>

              <strong>
                {rentalAmount.toLocaleString()} บาท
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                เงินประกัน
              </span>

              <strong>
                {depositAmount.toLocaleString()} บาท
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                ค่าจัดส่ง
              </span>

              <strong>
                {fulfillmentMethod === "pickup"
                  ? "0 บาท"
                  : deliveryFee !== null
                    ? `${deliveryFee.toLocaleString()} บาท`
                    : "รอคำนวณ"}
              </strong>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <div className="flex items-end justify-between gap-4">
                <strong className="text-gray-900">
                  รวมทั้งหมด
                </strong>

                <div>
                  <strong className="text-2xl font-black text-red-600">
                    {finalTotal.toLocaleString()}
                  </strong>

                  <span className="ml-1 text-xs font-bold">
                    บาท
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* SUBMIT */}
        <div>
          <button
            type="submit"
            disabled={
              submitting ||
              calculatingDelivery ||
              (fulfillmentMethod === "delivery" &&
                (contactRequired || deliveryFee === null))
            }
            className="flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            {submitting
              ? "กำลังสร้างรายการจอง..."
              : fulfillmentMethod === "delivery"
                ? "ยืนยันการจองและไปชำระเงิน →"
                : "ยืนยันการจองและไปชำระเงิน →"}
          </button>

          <p className="mt-3 text-center text-[11px] leading-5 text-gray-500">
            หลังยืนยันรายการ ระบบจะสร้างเลขที่การจอง
            และนำคุณไปยังหน้าชำระเงิน
          </p>
        </div>
      </form>
    </div>
  );
}