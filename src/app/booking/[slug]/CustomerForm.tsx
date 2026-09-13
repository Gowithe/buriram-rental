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

  const [deliveryError, setDeliveryError] =
    useState("");

  const [customerNote, setCustomerNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const finalTotal =
    fulfillmentMethod === "delivery" &&
    deliveryFee !== null
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

        p_start_datetime: new Date(
          startDate
        ).toISOString(),

        p_end_datetime: new Date(
          endDate
        ).toISOString(),

        p_customer_name: customerName.trim(),

        p_phone: phone.trim(),

        p_line_contact:
          lineContact.trim() || null,

        p_fulfillment_method: "pickup",

        p_delivery_address: null,

        p_customer_note:
          customerNote.trim() || null,
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
          lineContact:
            lineContact.trim() || null,
          deliveryAddress,
          deliveryLatitude,
          deliveryLongitude,
          customerNote:
            customerNote.trim() || null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (
        data.message ===
        "DELIVERY_DISTANCE_TOO_FAR"
      ) {
        throw new Error(
          "DELIVERY_DISTANCE_TOO_FAR"
        );
      }

      if (
        data.message ===
        "PRODUCT_NOT_AVAILABLE"
      ) {
        throw new Error(
          "PRODUCT_NOT_AVAILABLE"
        );
      }

      throw new Error(
        data.message ||
          "BOOKING_CREATION_FAILED"
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
        bookingNumber =
          await createPickupBooking();
      } else {
        bookingNumber =
          await createDeliveryBooking();
      }

      router.push(
        `/payment/${bookingNumber}`
      );
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message.includes(
          "PRODUCT_NOT_AVAILABLE"
        )
      ) {
        setErrorMessage(
          "ช่วงเวลานี้ถูกจองไปแล้ว กรุณาเลือกวันหรือเวลาอื่น"
        );
      } else if (
        message.includes(
          "DELIVERY_DISTANCE_TOO_FAR"
        )
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
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          ข้อมูลผู้เช่า
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          กรอกข้อมูลเพื่อยืนยันการจอง {productName}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            ชื่อผู้เช่า *
          </label>

          <input
            type="text"
            value={customerName}
            onChange={(event) =>
              setCustomerName(event.target.value)
            }
            placeholder="ชื่อ-นามสกุล"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            เบอร์โทรศัพท์ *
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            placeholder="เช่น 0812345678"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            LINE ID / เบอร์ติดต่อ LINE
          </label>

          <input
            type="text"
            value={lineContact}
            onChange={(event) =>
              setLineContact(event.target.value)
            }
            placeholder="ไม่บังคับ"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            วิธีรับสินค้า *
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setFulfillmentMethod("pickup");
                resetDelivery();
                setErrorMessage("");
              }}
              className={`rounded-xl border p-4 text-left transition ${
                fulfillmentMethod === "pickup"
                  ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                  : "border-gray-200 bg-white"
              }`}
            >
              <p className="font-medium text-gray-900">
                รับสินค้าเอง
              </p>

              <p className="mt-1 text-sm text-green-700">
                ฟรี
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setFulfillmentMethod("delivery");
                setErrorMessage("");
              }}
              className={`rounded-xl border p-4 text-left transition ${
                fulfillmentMethod === "delivery"
                  ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                  : "border-gray-200 bg-white"
              }`}
            >
              <p className="font-medium text-gray-900">
                จัดส่งถึงที่
              </p>

              <p className="mt-1 text-sm text-gray-500">
                คิดค่าจัดส่งตามระยะทาง
              </p>
            </button>
          </div>
        </div>

        {fulfillmentMethod === "delivery" && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <label className="mb-2 block text-sm font-medium text-green-900">
              ค้นหาสถานที่จัดส่ง *
            </label>

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

            {deliveryAddress && (
              <div className="mt-4 rounded-xl bg-white p-3 text-sm">
                {deliveryAddress}
              </div>
            )}

            {calculatingDelivery && (
              <div className="mt-3 rounded-xl bg-white p-3 text-sm text-gray-600">
                กำลังคำนวณระยะทางและค่าจัดส่ง...
              </div>
            )}

            {deliveryError && (
              <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {deliveryError}
              </div>
            )}

            {!calculatingDelivery &&
              deliveryDistanceKm !== null &&
              deliveryFee !== null &&
              !contactRequired && (
                <div className="mt-3 rounded-xl bg-white p-4">
                  <div className="flex justify-between text-sm">
                    <span>ระยะทางตามถนน</span>

                    <strong>
                      {deliveryDistanceKm.toLocaleString()} กม.
                    </strong>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <span>ค่าจัดส่ง</span>

                    <strong className="text-green-700">
                      {deliveryFee.toLocaleString()} บาท
                    </strong>
                  </div>
                </div>
              )}

            {contactRequired && (
              <div className="mt-3 rounded-xl bg-orange-50 p-4 text-sm text-orange-800">
                ระยะทางเกิน 15 กม.
                กรุณาติดต่อร้านเพื่อประเมินค่าจัดส่ง
              </div>
            )}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            หมายเหตุ
          </label>

          <textarea
            value={customerNote}
            onChange={(event) =>
              setCustomerNote(event.target.value)
            }
            rows={3}
            placeholder="รายละเอียดเพิ่มเติม"
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
          />
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="font-medium text-gray-900">
            สรุปรายการจอง
          </p>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>ค่าเช่า</span>

              <span>
                {rentalAmount.toLocaleString()} บาท
              </span>
            </div>

            <div className="flex justify-between">
              <span>ค่ามัดจำ</span>

              <span>
                {depositAmount.toLocaleString()} บาท
              </span>
            </div>

            <div className="flex justify-between">
              <span>ค่าจัดส่ง</span>

              <span>
                {fulfillmentMethod === "pickup"
                  ? "ฟรี"
                  : deliveryFee !== null
                    ? `${deliveryFee.toLocaleString()} บาท`
                    : "รอคำนวณ"}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between font-semibold">
                <span>ยอดรวม</span>

                <span>
                  {finalTotal.toLocaleString()} บาท
                </span>
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            calculatingDelivery ||
            (fulfillmentMethod === "delivery" &&
              (contactRequired ||
                deliveryFee === null))
          }
          className="w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {submitting
            ? "กำลังสร้างรายการจอง..."
            : fulfillmentMethod === "delivery"
              ? "ยืนยันการจองและจัดส่ง"
              : "ยืนยันการจอง"}
        </button>
      </form>
    </div>
  );
}