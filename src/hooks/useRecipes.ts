import { useEffect, useState } from 'react';
import type { Recipe } from '../types/recipe.ts';
import { recipeStore } from '../services/store.ts';
import { validateRecipe } from '../utils/validation.ts';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await recipeStore.list();
        setRecipes(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function upsert(r: Recipe) {
    const err = validateRecipe(r);
    if (err) throw new Error(err);

    const exists = recipes.some(x => x.id === r.id);
    if (exists) {
      await recipeStore.update(r);
      setRecipes(prev => prev.map(x => (x.id === r.id ? r : x)));
    } else {
      const created = await recipeStore.create(r);
      console.log('Created recipe:', created.name, 'at position 0');
      setRecipes(prev => {
        const newRecipes = [created, ...prev];
        console.log(
          'New recipes order:',
          newRecipes.map(r => r.name)
        );
        return newRecipes;
      });
    }
  }

  async function remove(id: string) {
    await recipeStore.remove(id);
    setRecipes(prev => prev.filter(x => x.id !== id));
  }

  async function importMany(rs: Recipe[]) {
    await recipeStore.importMany(rs);
    setRecipes(rs);
  }

  function exportAll(): string {
    return JSON.stringify(recipes, null, 2);
  }

  return {
    recipes,
    loading,
    error,
    setError,
    upsert,
    remove,
    importMany,
    exportAll,
  };
}
