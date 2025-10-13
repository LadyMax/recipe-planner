import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      // Immediately clear hover state to ensure color changes instantly
      setIsHovered(false);
      toggleFavorite(recipeId);
    } else {
      // Demo mode: allow clicking even when not authenticated
      setIsHovered(false);
      toggleFavorite(recipeId);
    }
  };

  const isFavorited = isFavorite(recipeId);

  // Always show favorite button (for demo purposes)
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <svg
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      width={size === 'sm' ? '32' : '40'}
      height={size === 'sm' ? '32' : '40'}
      viewBox="0 0 16 16"
      className={`favorite-button ${isAuthenticated ? 'authenticated' : 'not-authenticated'} ${isHovered ? 'hovered' : 'normal'} ${isFavorited ? 'favorited' : 'unfavorited'}`}
    >
      <path
        d="M4.74 1.25c-.766 0-1.584.21-2.402.735C.809 2.967.158 4.518.26 6.129c.1 1.585.92 3.204 2.266 4.47 1.654 1.558 3.486 3.042 4.408 3.77a1.716 1.716 0 0 0 2.132 0c.922-.728 2.753-2.211 4.407-3.77 1.346-1.266 2.166-2.885 2.267-4.47.101-1.61-.55-3.162-2.078-4.144-.819-.526-1.637-.735-2.402-.735-1.2 0-2.186.634-2.822 1.182-.164.14-.31.28-.438.412a7 7 0 0 0-.438-.412C6.926 1.884 5.941 1.25 4.74 1.25"
      />
    </svg>
  );
}
