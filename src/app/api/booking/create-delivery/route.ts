import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      productId,
      startDate,
      endDate,
      customerName,
      phone,
      lineContact,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      customerNote,
    } = body;

    // -----------------------------
    // 1. ตรวจข้อมูลจากลูกค้า
    // -----------------------------

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "PRODUCT_REQUIRED",
        },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "BOOKING_DATES_REQUIRED",
        },
        { status: 400 }
      );
    }

    if (!customerName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "CUSTOMER_NAME_REQUIRED",
        },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "PHONE_REQUIRED",
        },
        { status: 400 }
      );
    }

    if (!deliveryAddress?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "DELIVERY_ADDRESS_REQUIRED",
        },
        { status: 400 }
      );
    }

    const destinationLat = Number(deliveryLatitude);
    const destinationLng = Number(deliveryLongitude);

    if (
      !Number.isFinite(destinationLat) ||
      !Number.isFinite(destinationLng)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "INVALID_DESTINATION",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // 2. อ่านข้อมูลลับจาก Server
    // -----------------------------

    const originLat = Number(
      process.env.RENTAL_ORIGIN_LAT
    );

    const originLng = Number(
      process.env.RENTAL_ORIGIN_LNG
    );

    const routesApiKey =
      process.env.GOOGLE_ROUTES_API_KEY;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !Number.isFinite(originLat) ||
      !Number.isFinite(originLng)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ORIGIN_NOT_CONFIGURED",
        },
        { status: 500 }
      );
    }

    if (!routesApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "ROUTES_API_KEY_NOT_CONFIGURED",
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          message: "SUPABASE_SERVER_NOT_CONFIGURED",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // 3. คำนวณระยะทางใหม่จาก Google
    // -----------------------------

    const routeResponse = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "X-Goog-Api-Key":
            routesApiKey,

          "X-Goog-FieldMask":
            "routes.distanceMeters,routes.duration",
        },

        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: originLat,
                longitude: originLng,
              },
            },
          },

          destination: {
            location: {
              latLng: {
                latitude:
                  destinationLat,

                longitude:
                  destinationLng,
              },
            },
          },

          travelMode: "DRIVE",

          routingPreference:
            "TRAFFIC_UNAWARE",

          computeAlternativeRoutes:
            false,

          languageCode: "th",

          units: "METRIC",
        }),
      }
    );

    const routeData =
      await routeResponse.json();

    if (!routeResponse.ok) {
      console.error(
        "Google Routes API error:",
        routeData
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "ROUTE_CALCULATION_FAILED",
        },
        { status: 500 }
      );
    }

    const route =
      routeData?.routes?.[0];

    if (
      !route ||
      typeof route.distanceMeters !==
        "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ROUTE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // 4. คำนวณค่าจัดส่ง
    // -----------------------------

    const distanceMeters =
      route.distanceMeters;

    const distanceKm =
      distanceMeters / 1000;

    let deliveryFee: number;

    if (distanceKm <= 5) {
      deliveryFee = 50;
    } else if (distanceKm <= 10) {
      deliveryFee = 100;
    } else if (distanceKm <= 15) {
      deliveryFee = 150;
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "DELIVERY_DISTANCE_TOO_FAR",

          distanceKm:
            Math.round(
              distanceKm * 10
            ) / 10,
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // 5. สร้าง Supabase Service Client
    // -----------------------------

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

    // -----------------------------
    // 6. สร้าง Booking
    // -----------------------------

    const {
      data,
      error,
    } = await supabase.rpc(
      "create_delivery_booking",
      {
        p_product_id:
          Number(productId),

        p_start_datetime:
          new Date(
            startDate
          ).toISOString(),

        p_end_datetime:
          new Date(
            endDate
          ).toISOString(),

        p_customer_name:
          customerName.trim(),

        p_phone:
          phone.trim(),

        p_line_contact:
          lineContact?.trim() || null,

        p_delivery_address:
          deliveryAddress.trim(),

        p_customer_note:
          customerNote?.trim() ||
          null,

        p_delivery_fee:
          deliveryFee,
      }
    );

    if (error) {
      console.error(
        "Create delivery booking error:",
        error
      );

      if (
        error.message.includes(
          "PRODUCT_NOT_AVAILABLE"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "PRODUCT_NOT_AVAILABLE",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "BOOKING_CREATION_FAILED",
        },
        { status: 500 }
      );
    }

    const booking =
      data?.[0];

    if (
      !booking?.booking_number
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "BOOKING_NOT_RETURNED",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // 7. ส่งข้อมูลกลับ Browser
    // -----------------------------

    return NextResponse.json({
      success: true,

      bookingNumber:
        booking.booking_number,

      rentalAmount:
        Number(
          booking.rental_amount
        ),

      depositAmount:
        Number(
          booking.deposit_amount
        ),

      deliveryFee:
        Number(
          booking.delivery_fee
        ),

      grandTotal:
        Number(
          booking.grand_total
        ),

      distanceKm:
        Math.round(
          distanceKm * 10
        ) / 10,

      paymentExpiresAt:
        booking.payment_expires_at,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}