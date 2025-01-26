import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "@/public/assets/logo.webp";

export function Logo({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative", className)} {...props}>
      <Image
        src={logo}
        alt="Hotel Oasis"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
