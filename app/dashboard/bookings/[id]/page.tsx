// Booking detail page for managing a single reservation
import { notFound } from "next/navigation";
import { bookingService } from "@/services/bookingService";
import { BookingDetail } from "@/components/dashboard/booking-detail";

interface BookingDetailPageProps {
  params: { id: string };
}

// Type guard para promesa
function isPromise<T>(val: unknown): val is Promise<T> {
  return !!val && typeof val === "object" && typeof (val as { then?: unknown }).then === "function";
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const resolvedParams = isPromise(params) ? await params : params;
  const resolvedParamsObj = resolvedParams as { id: string };
  const bookingId = Number(resolvedParamsObj.id);
  if (isNaN(bookingId)) return notFound();
  const booking = await bookingService.getBooking(bookingId);
  if (!booking) return notFound();

  // Type guard para objeto Decimal-like
  function hasToNumber(val: unknown): val is { toNumber: () => number } {
    return (
      !!val &&
      typeof val === "object" &&
      typeof (val as { toNumber?: unknown }).toNumber === "function"
    );
  }

  // Serializa Decimals y fechas a string ISO
  function serializeBooking(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(serializeBooking);
    if (obj && typeof obj === "object") {
      const result: Record<string, unknown> = {};
      for (const key in obj) {
        const val = (obj as Record<string, unknown>)[key];
        if (hasToNumber(val)) {
          result[key] = val.toNumber();
        } else if (val instanceof Date) {
          result[key] = val.toISOString();
        } else {
          result[key] = serializeBooking(val);
        }
      }
      return result;
    }
    return obj;
  }

  const plainBooking = serializeBooking(booking) as import("@/components/dashboard/booking-detail").BookingWithRelations;
  return <BookingDetail booking={plainBooking} />;
}
