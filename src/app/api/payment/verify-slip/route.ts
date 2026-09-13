import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const easySlipApiKey = process.env.EASYSLIP_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!easySlipApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบ EASYSLIP_API_KEY",
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          message: "การตั้งค่า Supabase Server ไม่ครบ",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const slip = formData.get("slip");
    const bookingNumber = formData.get("bookingNumber");

    if (!(slip instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเลือกรูปสลิป",
        },
        { status: 400 }
      );
    }

    if (
      typeof bookingNumber !== "string" ||
      !bookingNumber.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบเลขที่การจอง",
        },
        { status: 400 }
      );
    }

    const cleanBookingNumber = bookingNumber.trim();

    // จำกัดขนาดไฟล์ 4 MB
    if (slip.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "ไฟล์สลิปต้องมีขนาดไม่เกิน 4 MB",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(slip.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "ประเภทไฟล์สลิปไม่รองรับ",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 1. อ่านข้อมูล Booking ด้วย RPC แบบ public-safe
    // ------------------------------------------------

    const publicSupabase = await createClient();

    const { data: bookingData, error: bookingError } =
      await publicSupabase.rpc("get_booking_payment", {
        p_booking_number: cleanBookingNumber,
      });

    if (bookingError) {
      console.error("Booking RPC error:", bookingError);

      return NextResponse.json(
        {
          success: false,
          message: "ไม่สามารถตรวจสอบข้อมูลการจองได้",
        },
        { status: 500 }
      );
    }

    const booking = bookingData?.[0];

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลการจอง",
        },
        { status: 404 }
      );
    }

    // ถ้าจ่ายไปแล้ว ไม่ต้องส่ง EasySlip ซ้ำ
    if (booking.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        message: "การจองนี้ชำระเงินเรียบร้อยแล้ว",
        bookingNumber: booking.booking_number,
      });
    }

    const expired =
      booking.payment_expires_at &&
      new Date(booking.payment_expires_at).getTime() <
        Date.now();

    if (expired) {
      return NextResponse.json(
        {
          success: false,
          message: "หมดเวลาชำระเงินสำหรับการจองนี้แล้ว",
        },
        { status: 400 }
      );
    }

    const expectedAmount = Number(booking.grand_total);

    if (
      !Number.isFinite(expectedAmount) ||
      expectedAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ยอดชำระของการจองไม่ถูกต้อง",
        },
        { status: 500 }
      );
    }

    // ------------------------------------------------
    // 2. ส่งสลิปให้ EasySlip ตรวจ
    // ------------------------------------------------

    const easySlipForm = new FormData();

    easySlipForm.append("image", slip);
    easySlipForm.append(
      "remark",
      `Buriram Rental ${booking.booking_number}`
    );

    easySlipForm.append("matchAccount", "true");
    easySlipForm.append(
      "matchAmount",
      expectedAmount.toString()
    );
    easySlipForm.append("checkDuplicate", "true");

    const easySlipResponse = await fetch(
      "https://api.easyslip.com/v2/verify/bank",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${easySlipApiKey}`,
        },
        body: easySlipForm,
        cache: "no-store",
      }
    );

    const responseText = await easySlipResponse.text();

    let easySlipResult: any;

    try {
      easySlipResult = JSON.parse(responseText);
    } catch {
      console.error(
        "EasySlip returned non-JSON:",
        responseText
      );

      return NextResponse.json(
        {
          success: false,
          message: "EasySlip ส่งข้อมูลตอบกลับไม่ถูกต้อง",
        },
        { status: 502 }
      );
    }

    if (
      !easySlipResponse.ok ||
      !easySlipResult?.success
    ) {
      console.error(
        "EasySlip verification error:",
        easySlipResult
      );

      const errorCode =
        easySlipResult?.error?.code ||
        easySlipResult?.code ||
        "VERIFY_FAILED";

      let message =
        easySlipResult?.error?.message ||
        easySlipResult?.message ||
        "ตรวจสอบสลิปไม่สำเร็จ";

      if (errorCode === "SLIP_NOT_FOUND") {
        message =
          "ไม่พบข้อมูลสลิป กรุณาใช้ภาพสลิปที่ชัดเจน";
      }

      if (errorCode === "QUOTA_EXCEEDED") {
        message =
          "โควตา EasySlip หมด กรุณาติดต่อผู้ดูแลระบบ";
      }

      return NextResponse.json(
        {
          success: false,
          message,
          errorCode,
        },
        {
          status:
            easySlipResponse.status >= 400
              ? easySlipResponse.status
              : 400,
        }
      );
    }

    const verification = easySlipResult.data;

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          message: "EasySlip ไม่ส่งข้อมูลสลิปกลับมา",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 3. ตรวจผลจาก EasySlip
    // ------------------------------------------------

    if (verification.isDuplicate === true) {
      return NextResponse.json(
        {
          success: false,
          message: "สลิปนี้เคยถูกใช้ตรวจสอบแล้ว",
        },
        { status: 400 }
      );
    }

    if (verification.isAmountMatched !== true) {
      return NextResponse.json(
        {
          success: false,
          message: `ยอดเงินในสลิปไม่ตรงกับยอด ${expectedAmount.toLocaleString()} บาท`,
        },
        { status: 400 }
      );
    }

    if (!verification.matchedAccount) {
      return NextResponse.json(
        {
          success: false,
          message:
            "บัญชีผู้รับเงินไม่ตรงกับบัญชีที่กำหนดไว้",
        },
        { status: 400 }
      );
    }

    // หา transaction reference จาก EasySlip
    const paymentReference =
      verification.rawSlip?.transRef ||
      verification.transRef ||
      verification.reference ||
      null;

    if (!paymentReference) {
      console.error(
        "EasySlip payment reference missing:",
        verification
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่พบเลขอ้างอิงธุรกรรมจากสลิป จึงยังไม่สามารถยืนยันการจองได้",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 4. EasySlip ผ่านแล้ว
    //    ใช้ Service Role ยืนยัน Booking
    // ------------------------------------------------

    const adminSupabase = createSupabaseClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: confirmData, error: confirmError } =
      await adminSupabase.rpc(
        "confirm_booking_payment",
        {
          p_booking_number: cleanBookingNumber,
          p_payment_reference: String(paymentReference),
        }
      );

    if (confirmError) {
      console.error(
        "Confirm booking payment error:",
        confirmError
      );

      let message =
        "ตรวจสลิปผ่านแล้ว แต่ไม่สามารถยืนยันการจองได้";

      if (
        confirmError.message.includes(
          "PAYMENT_REFERENCE_ALREADY_USED"
        )
      ) {
        message =
          "ธุรกรรมนี้ถูกใช้ยืนยันการจองอื่นแล้ว";
      }

      if (
        confirmError.message.includes("PAYMENT_EXPIRED")
      ) {
        message =
          "ตรวจพบการชำระเงิน แต่การจองหมดเวลาแล้ว";
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 500 }
      );
    }

    const confirmedBooking = confirmData?.[0];

    // ------------------------------------------------
    // 5. สำเร็จ
    // ------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "ชำระเงินสำเร็จ การจองได้รับการยืนยันแล้ว",
      booking: {
        bookingNumber:
          confirmedBooking?.booking_number ||
          cleanBookingNumber,
        bookingStatus:
          confirmedBooking?.booking_status ||
          "confirmed",
        paymentStatus:
          confirmedBooking?.payment_status || "paid",
        paidAt:
          confirmedBooking?.paid_at || null,
      },
    });
  } catch (error) {
    console.error(
      "Verify slip server error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน",
      },
      { status: 500 }
    );
  }
}