import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface FavoriteButtonProps {
  recipeId: number;
  size?: 'sm' | 'lg';
}

export default function FavoriteButton({
  recipeId,
  size = 'sm',
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isAuthenticated) {
      toggleFavorite(recipeId);
    }
  };

  const isFavorited = isFavorite(recipeId);

  // If not logged in, do not show favorite button
  if (!isAuthenticated) {
    return null;
  }

  // Determine fill color based on favorite status and hover state
  const getFillColor = () => {
    if (isFavorited) {
      return 'var(--heart-favorited)'; // Red for favorited items
    }
    if (isHovered) {
      return 'var(--heart-hover)'; // Red when hovering over non-favorited items
    }
    return 'var(--heart-unfavorited)'; // Gray for non-favorited items
  };

  return (
    <svg
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      width={size === 'sm' ? '32' : '40'}
      height={size === 'sm' ? '32' : '40'}
      viewBox="0 0 16 16"
      style={{
        cursor: isAuthenticated ? 'pointer' : 'not-allowed',
        opacity: isAuthenticated ? 1 : 0.6,
        zIndex: 20,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        transition: 'transform 0.2s ease',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <path
        fill={getFillColor()}
        d="M4.74 1.25c-.766 0-1.584.21-2.402.735C.809 2.967.158 4.518.26 6.129c.1 1.585.92 3.204 2.266 4.47 1.654 1.558 3.486 3.042 4.408 3.77a1.716 1.716 0 0 0 2.132 0c.922-.728 2.753-2.211 4.407-3.77 1.346-1.266 2.166-2.885 2.267-4.47.101-1.61-.55-3.162-2.078-4.144-.819-.526-1.637-.735-2.402-.735-1.2 0-2.186.634-2.822 1.182-.164.14-.31.28-.438.412a7 7 0 0 0-.438-.412C6.926 1.884 5.941 1.25 4.74 1.25"
      />
    </svg>
  );
}
