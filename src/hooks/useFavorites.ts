import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from backend or local storage
  const loadFavorites = useCallback(async () => {
    if (!user) {
      // Use localStorage when not authenticated
      const localFavorites = localStorage.getItem('demo-favorites');
      if (localFavorites) {
        setFavorites(JSON.parse(localFavorites));
      } else {
        setFavorites([]);
      }
      return;
    }

    try {
      setLoading(true);
      // Load only current user's favorites
      const response = await fetch(`/api/favorites?where=user_id=${user.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const favoriteIds = data.map((fav: { recipe_id: number }) => fav.recipe_id);
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
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addToFavorites = async (recipeId: number) => {
    if (!user) return;

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          user_id: user.id,
          recipe_id: recipeId 
        }),
      });

      if (response.ok) {
        setFavorites(prev => [...prev, recipeId]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setError('Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (recipeId: number) => {
    if (!user) return;

    try {
      // First, find the favorite record ID by querying with user_id and recipe_id
      const findResponse = await fetch(`/api/favorites?where=user_id=${user.id}&where=recipe_id=${recipeId}`, {
        credentials: 'include',
      });

      if (findResponse.ok) {
        const favoriteRecords = await findResponse.json();
        if (favoriteRecords.length > 0) {
          const favoriteId = favoriteRecords[0].id;
          
          // Now delete using the favorite record ID
          const response = await fetch(`/api/favorites/${favoriteId}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            setFavorites(prev => prev.filter(id => id !== recipeId));
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to remove from favorites');
          }
        } else {
          setError('Favorite record not found');
        }
      } else {
        setError('Failed to find favorite record');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setError('Failed to remove from favorites');
    }
  };

  const toggleFavorite = async (recipeId: number) => {
    if (!user) {
      // Use localStorage when not authenticated
      const newFavorites = favorites.includes(recipeId)
        ? favorites.filter(id => id !== recipeId)
        : [...favorites, recipeId];
      setFavorites(newFavorites);
      localStorage.setItem('demo-favorites', JSON.stringify(newFavorites));
      return;
    }

    if (favorites.includes(recipeId)) {
      await removeFromFavorites(recipeId);
    } else {
      await addToFavorites(recipeId);
    }
    
    // Reload favorites to ensure UI is up to date
    await loadFavorites();
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
      console.error('Error clearing favorites:', error);
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
