import { Badge } from "@/components/ui/badge";

interface RoomAmenitiesProps {
  amenities: string[];
  maxVisible?: number;
  className?: string;
}

export function RoomAmenities({ 
  amenities, 
  maxVisible = 2, 
  className = "" 
}: RoomAmenitiesProps) {
  const visibleAmenities = amenities.slice(0, maxVisible);
  const remainingCount = amenities.length - maxVisible;

  return (
    <div className={`flex flex-wrap gap-1 pt-1 ${className}`}>
      {visibleAmenities.map((amenity) => (
        <Badge
          key={amenity}
          variant="secondary"
          className="text-[10px] px-1 py-0"
        >
          {amenity}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="secondary"
          className="text-[10px] px-1 py-0"
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
