import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, totalReviews, size = 'sm', interactive = false, onRate }) {
  const stars = [1, 2, 3, 4, 5];
  const starSize = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {stars.map((star) => {
          const filled = star <= Math.round(rating);
          return (
            <button
              type="button"
              key={star}
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              <Star
                className={`${starSize} ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                }`}
              />
            </button>
          );
        })}
      </div>
      {typeof totalReviews !== 'undefined' && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {Number(rating).toFixed(1)} <span className="font-normal text-slate-500">({totalReviews})</span>
        </span>
      )}
    </div>
  );
}
