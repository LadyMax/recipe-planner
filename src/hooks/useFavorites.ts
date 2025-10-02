import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from backend
  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/favorites', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const favoriteIds = data.map((fav: any) => fav.recipe_id);
        setFavorites(favoriteIds);
      } else {
        console.error('Failed to load favorites');
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const addToFavorites = async (recipeId: number) => {
    if (!user) return;

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipe_id: recipeId }),
      });

      if (response.ok) {
        setFavorites(prev => [...prev, recipeId]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add to favorites');
      }
    } catch (error) {
      setError('Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (recipeId: number) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/favorites/${recipeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(id => id !== recipeId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to remove from favorites');
      }
    } catch (error) {
      setError('Failed to remove from favorites');
    }
  };

  const toggleFavorite = async (recipeId: number) => {
    if (favorites.includes(recipeId)) {
      await removeFromFavorites(recipeId);
    } else {
      await addToFavorites(recipeId);
    }
  };

  const isFavorite = (recipeId: number) => {
    return favorites.includes(recipeId);
  };

  const clearFavorites = async () => {
    if (!user) return;

    try {
      // Remove all favorites one by one
      await Promise.all(favorites.map(id => removeFromFavorites(id)));
    } catch (error) {
      setError('Failed to clear favorites');
    }
  };

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    refresh: loadFavorites,
  };
}
