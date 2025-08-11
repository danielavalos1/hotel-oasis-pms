import { Badge } from "@/components/ui/badge";
import { RoomStatus } from "@prisma/client";
import { ROOM_STATUS_VARIANTS, ROOM_STATUS_LABELS } from "@/lib/room-constants";

interface RoomStatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${ROOM_STATUS_VARIANTS[status]} ${className || ""}`}
    >
      {ROOM_STATUS_LABELS[status]}
    </Badge>
  );
}
