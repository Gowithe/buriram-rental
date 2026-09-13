"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onPlaceSelected: (place: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
};

let googleMapsLoadingPromise: Promise<void> | null = null;

function waitForPlacesLibrary(): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      const win = window as any;

      if (
        win.google?.maps?.places?.PlaceAutocompleteElement
      ) {
        window.clearInterval(timer);
        resolve();
        return;
      }

      if (Date.now() - startedAt > 10000) {
        window.clearInterval(timer);

        reject(
          new Error(
            "Google Places library did not become available"
          )
        );
      }
    }, 100);
  });
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  const win = window as any;

  if (
    win.google?.maps?.places?.PlaceAutocompleteElement
  ) {
    return Promise.resolve();
  }

  if (googleMapsLoadingPromise) {
    return googleMapsLoadingPromise;
  }

  googleMapsLoadingPromise = new Promise(
    (resolve, reject) => {
      const existingScript =
        document.querySelector(
          'script[data-google-maps="true"]'
        ) as HTMLScriptElement | null;

      if (existingScript) {
        waitForPlacesLibrary()
          .then(resolve)
          .catch(reject);

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://maps.googleapis.com/maps/api/js" +
        `?key=${encodeURIComponent(apiKey)}` +
        "&libraries=places" +
        "&loading=async" +
        "&v=weekly";

      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = "true";

      script.onload = () => {
        waitForPlacesLibrary()
          .then(resolve)
          .catch(reject);
      };

      script.onerror = () => {
        reject(
          new Error(
            "Failed to load Google Maps JavaScript API"
          )
        );
      };

      document.head.appendChild(script);
    }
  );

  return googleMapsLoadingPromise;
}

export default function GooglePlaceAutocomplete({
  onPlaceSelected,
}: Props) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function initGooglePlaces() {
      try {
        setLoading(true);
        setErrorMessage("");

        const apiKey =
          process.env
            .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          if (!cancelled) {
            setErrorMessage(
              "ไม่พบ Google Maps API Key"
            );

            setLoading(false);
          }

          return;
        }

        await loadGoogleMaps(apiKey);

        if (cancelled) return;

        const win = window as any;

        const PlaceAutocompleteElement =
          win.google?.maps?.places
            ?.PlaceAutocompleteElement;

        if (!PlaceAutocompleteElement) {
          throw new Error(
            "PlaceAutocompleteElement is unavailable"
          );
        }

        const autocomplete =
          new PlaceAutocompleteElement();

        autocomplete.placeholder =
          "ค้นหาสถานที่ เช่น โรบินสันบุรีรัมย์";

        autocomplete.style.width =
          "100%";

        autocomplete.style.display =
          "block";

        autocomplete.style.minHeight =
          "48px";

        autocomplete.style.fontSize =
          "16px";

        autocomplete.addEventListener(
          "gmp-select",

          async (event: any) => {
            try {
              const placePrediction =
                event.placePrediction;

              if (!placePrediction) {
                return;
              }

              const place =
                placePrediction.toPlace();

              await place.fetchFields({
                fields: [
                  "displayName",
                  "formattedAddress",
                  "location",
                ],
              });

              if (!place.location) {
                return;
              }

              const address =
                place.formattedAddress ||
                place.displayName ||
                "";

              const latitude =
                place.location.lat();

              const longitude =
                place.location.lng();

              onPlaceSelected({
                address,
                latitude,
                longitude,
              });
            } catch (error) {
              console.error(
                "Google Place selection error:",
                error
              );
            }
          }
        );

        if (!containerRef.current) {
          return;
        }

        containerRef.current.innerHTML =
          "";

        containerRef.current.appendChild(
          autocomplete
        );

        if (!cancelled) {
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Google Places initialization error:",
          error
        );

        if (!cancelled) {
          setErrorMessage(
            "ไม่สามารถโหลดระบบค้นหาสถานที่ได้ กรุณารีเฟรชหน้าแล้วลองใหม่"
          );

          setLoading(false);
        }
      }
    }

    initGooglePlaces();

    return () => {
      cancelled = true;
    };
  }, [onPlaceSelected]);

  return (
    <div>
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          กำลังโหลดระบบค้นหาสถานที่...
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div
        ref={containerRef}
        className={loading ? "hidden" : ""}
      />
    </div>
  );
}