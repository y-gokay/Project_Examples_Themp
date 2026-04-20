import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KindergartenCardProps {
  id: string;
  name: string;
  address: string;
  image: string;
  available: boolean;
}

export function KindergartenCard({
  id,
  name,
  address,
  image,
  available,
}: KindergartenCardProps) {
  return (
    <div className="group relative h-full bg-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border border-border/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
      {/* Image Section */}
      <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden bg-muted">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Floating Status Badge - Only show when NOT available */}
        {!available && (
          <div className="absolute top-3 sm:top-4 md:top-5 left-3 sm:left-4 md:left-5 z-10">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-900/20 border-2 border-white/20 backdrop-blur-md">
              Kontenjan Dolu
            </span>
          </div>
        )}

        {/* Title & Address Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pt-10 sm:pt-12">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white leading-tight drop-shadow-md">
            {name}
          </h3>
          <div className="flex items-start gap-2 text-xs sm:text-sm font-medium text-white/90">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary mt-0.5" />
            <span className="leading-snug opacity-90">{address}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-6 bg-card flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-auto">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="flex-1 rounded-xl sm:rounded-2xl border-2 hover:bg-muted text-sm sm:text-base font-medium h-11 sm:h-12 transition-colors"
        >
          <Link href={`/cgmerkezler/${id}`}>İncele</Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="flex-1 sm:flex-[1.5] rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-sm sm:text-base font-bold h-11 sm:h-12 transition-all hover:shadow-primary/30"
        >
          <Link
            href={`/basvuru?cgmerkez=${id}`}
            className="group/btn flex items-center justify-center gap-2"
          >
            Başvuru Yap
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
