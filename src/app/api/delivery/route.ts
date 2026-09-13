import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const destinationLat = Number(body.destinationLat);
    const destinationLng = Number(body.destinationLng);

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

    const originLat = Number(
      process.env.RENTAL_ORIGIN_LAT
    );

    const originLng = Number(
      process.env.RENTAL_ORIGIN_LNG
    );

    const apiKey =
      process.env.GOOGLE_ROUTES_API_KEY;

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

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "ROUTES_API_KEY_NOT_CONFIGURED",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "X-Goog-Api-Key": apiKey,

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
                latitude: destinationLat,
                longitude: destinationLng,
              },
            },
          },

          travelMode: "DRIVE",

          routingPreference:
            "TRAFFIC_UNAWARE",

          computeAlternativeRoutes: false,

          languageCode: "th",

          units: "METRIC",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Google Routes API error:",
        data
      );

      return NextResponse.json(
        {
          success: false,
          message: "ROUTE_CALCULATION_FAILED",
        },
        { status: 500 }
      );
    }

    const route = data?.routes?.[0];

    if (
      !route ||
      typeof route.distanceMeters !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ROUTE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const distanceMeters =
      route.distanceMeters;

    const distanceKm =
      distanceMeters / 1000;

    let deliveryFee: number | null = null;
    let contactRequired = false;

    if (distanceKm <= 5) {
      deliveryFee = 50;
    } else if (distanceKm <= 10) {
      deliveryFee = 100;
    } else if (distanceKm <= 15) {
      deliveryFee = 150;
    } else {
      contactRequired = true;
    }

    return NextResponse.json({
      success: true,
      distanceMeters,
      distanceKm:
        Math.round(distanceKm * 10) / 10,
      deliveryFee,
      contactRequired,
      duration:
        route.duration ?? null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}