import { Heart } from "lucide-react";

type Props = {
  rating: number;
  max?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: number;
};

export default function HeartRating({
  rating,
  max = 5,
  onRatingChange,
  interactive = false,
  size = 20,
}: Props) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const heartIndex = i + 1;
        const isFilled = heartIndex <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(heartIndex)}
            className={`${interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"} 
              ${isFilled ? "text-[#DE9DE5]" : "text-gray-300"}
            `}
          >
            <Heart
              size={size}
              fill={isFilled ? "#DE9DE5" : "none"}
              className="transition-colors"
            />
          </button>
        );
      })}
    </div>
  );
}
