"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  format,
  startOfMonth,
  endOfMonth,
  getDay,
  getDaysInMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { useRouter } from "next/navigation";

// Tipo Booking esperado desde la API
type BookingCalendarDTO = {
  id: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  status: string;
  totalAmount: number;
};

// Fetcher para useSWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Mapeo de colores por status (normalizados a minúsculas)
const statusColor: Record<string, string> = {
  confirmed: "bg-blue-200 text-blue-800",
  "checked-in": "bg-green-200 text-green-800",
  "checked-out": "bg-gray-200 text-gray-800",
  cancelled: "bg-red-200 text-red-800",
};

export function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // obtener bookings del mes
  const { data } = useSWR<{ success: boolean; data: BookingCalendarDTO[] }>(
    `/api/bookings?startDate=${format(
      monthStart,
      "yyyy-MM-dd"
    )}&endDate=${format(monthEnd, "yyyy-MM-dd")}`,
    fetcher
  );

  // Agrupar bookings por día
  const bookingsByDay = useMemo(() => {
    const map: Record<number, BookingCalendarDTO[]> = {};
    if (data?.success) {
      data.data.forEach((b) => {
        const day = new Date(b.checkIn).getDate();
        if (!map[day]) map[day] = [];
        map[day].push(b);
      });
    }
    return map;
  }, [data]);

  const daysInMonth = getDaysInMonth(currentDate);
  const startWeekDay = getDay(monthStart);

  return (
    <div className="p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="text-muted-foreground"
        >
          &lt;
        </button>
        <h3 className="text-lg font-medium">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="text-muted-foreground"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startWeekDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const bookings = bookingsByDay[day] || [];
          return (
            <div key={day} className="h-20 p-1 border rounded-sm flex flex-col">
              <span className="text-sm font-semibold">{day}</span>
              <div className="flex-1 overflow-hidden space-y-0.5">
                {bookings.slice(0, 3).map((b) => (
                  <span
                    key={b.id}
                    onClick={() => router.push(`/dashboard/bookings/${b.id}`)}
                    className={`block w-full truncate rounded px-1 text-[0.65rem] cursor-pointer transition hover:brightness-90 ${
                      statusColor[b.status?.toLowerCase?.()] ||
                      "bg-gray-200 text-gray-800"
                    }`}
                    title={`Reserva #${b.id} - ${b.guestName}`}
                  >
                    {b.roomNumber} ({b.status})
                  </span>
                ))}
                {bookings.length > 3 && (
                  <span className="text-[0.65rem] text-muted-foreground">
                    +{bookings.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
