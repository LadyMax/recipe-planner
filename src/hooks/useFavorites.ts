import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const FAVORITES_KEY = 'recipe-favorites';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const userFavorites = localStorage.getItem(`${FAVORITES_KEY}-${user.id}`);
      if (userFavorites) {
        try {
          setFavorites(JSON.parse(userFavorites));
        } catch (error) {
          console.error('Failed to parse favorites:', error);
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [user]);

  const saveFavorites = (newFavorites: string[]) => {
    if (user) {
      localStorage.setItem(
        `${FAVORITES_KEY}-${user.id}`,
        JSON.stringify(newFavorites)
      );
      setFavorites(newFavorites);
    }
  };

  const addToFavorites = (recipeId: string) => {
    if (!favorites.includes(recipeId)) {
      saveFavorites([...favorites, recipeId]);
    }
  };

  const removeFromFavorites = (recipeId: string) => {
    saveFavorites(favorites.filter(id => id !== recipeId));
  };

  const toggleFavorite = (recipeId: string) => {
    if (favorites.includes(recipeId)) {
      removeFromFavorites(recipeId);
    } else {
      addToFavorites(recipeId);
    }
  };

  const isFavorite = (recipeId: string) => {
    return favorites.includes(recipeId);
  };

  const clearFavorites = () => {
    saveFavorites([]);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
