import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { RecipeRating } from '../types/recipe';

interface RecipeRatingProps {
  recipeId: string;
  currentRating?: number;
  onRatingChange?: (rating: number) => void;
}

export default function RecipeRating({
  currentRating = 0,
  onRatingChange,
}: RecipeRatingProps) {
  const { isAuthenticated } = useAuth();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [userRating, setUserRating] = useState(currentRating);

  const handleRatingClick = (rating: number) => {
    if (!isAuthenticated) return;

    setUserRating(rating);
    onRatingChange?.(rating);

    // Here should call API to save rating
    // await saveRating(recipeId, rating);
  };

  const handleMouseEnter = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || userRating;

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="d-flex">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`btn btn-link p-0 me-1 ${
              isAuthenticated ? 'text-warning' : 'text-muted'
            }`}
            style={{
              fontSize: '1.2rem',
              color: star <= displayRating ? '#ffc107' : '#6c757d',
              cursor: isAuthenticated ? 'pointer' : 'default',
            }}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={!isAuthenticated}
            title={
              isAuthenticated ? `Rate ${star} stars` : 'Login required to rate'
            }
          >
            ★
          </button>
        ))}
      </div>
      <small className="text-muted">
        {userRating > 0 ? `${userRating}/5` : 'Not rated'}
      </small>
    </div>
  );
}
