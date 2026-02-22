import Image from "next/image";
import type { Survivor } from "@/lib/types";

interface Props {
  survivor: Survivor;
  rank?: number | null;
  eliminated?: boolean;
  badge?: React.ReactNode;
  onClick?: () => void;
  dimmed?: boolean;
}

export default function SurvivorCard({ survivor, rank, eliminated, badge, onClick, dimmed }: Props) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-1.5 transition
        ${onClick ? "cursor-pointer hover:bg-blue-50" : ""}
        ${eliminated ? "opacity-50 bg-gray-50 border-gray-200" : "bg-white border-gray-200"}
        ${dimmed ? "opacity-40" : ""}
      `}
    >
      {/* Rank badge */}
      {rank != null && (
        <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
          {rank}
        </span>
      )}

      {/* Photo */}
      <div className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-100">
        {survivor.image_path ? (
          <Image
            src={survivor.image_path}
            alt={survivor.name}
            fill
            className={`object-cover ${eliminated ? "grayscale" : ""}`}
            sizes="40px"
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-gray-400 text-sm font-semibold">
            {survivor.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Name + seasons */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${eliminated ? "line-through text-gray-400" : "text-gray-900"}`}>
          {survivor.name}
        </p>
        {survivor.previous_seasons && (
          <p className="text-xs text-gray-400 truncate">{survivor.previous_seasons}</p>
        )}
      </div>

      {/* Right badge slot */}
      {badge && <div className="shrink-0">{badge}</div>}

      {/* Eliminated label */}
      {eliminated && (
        <span className="shrink-0 text-xs text-red-500 font-medium">Eliminated</span>
      )}
    </div>
  );
}
