import { useEffect, useState } from 'react';
import type { Recipe } from '../types/recipe.ts';
import { recipeStore } from '../services/store.ts';
import { validateRecipe } from '../utils/validation.ts';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeStore.list();
      
      // Get ingredients data for each recipe
      const recipesWithIngredients = await Promise.all(
        data.map(async (recipe: Recipe) => {
          try {
            const ingredientsResponse = await fetch(`http://localhost:5001/api/ingredients?where=recipe_id=${recipe.id}&orderby=position`);
            if (ingredientsResponse.ok) {
              const ingredientsData = await ingredientsResponse.json();
              recipe.ingredients = ingredientsData.map((ing: {id: number; name: string; amount: string; unit: string}) => ({
                id: ing.id,
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit
              }));
            }
          } catch (error) {
            console.warn(`Failed to fetch ingredients for recipe ${recipe.id}:`, error);
          }
          return recipe;
        })
      );
      
      setRecipes(recipesWithIngredients);
    } catch (e: unknown) {
      setError((e as Error)?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  async function upsert(r: Recipe) {
    const err = validateRecipe(r);
    if (err) throw new Error(err);

    const exists = recipes.some(x => x.id === r.id);
    if (exists) {
      // Update existing recipe - send database fields
      const dbRecipe = {
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        description: r.description,
        category: r.category,
        cook_time_min: r.cook_time_min,
        difficulty: r.difficulty,
        image_url: r.image_url,
        created_at: r.created_at,
        updated_at: r.updated_at
      };
      
      try {
        // Update recipe in database
        await recipeStore.update(dbRecipe);
        
        // Update ingredients if they exist
        if (r.ingredients && r.ingredients.length > 0) {
          // First, delete existing ingredients
          await fetch(`http://localhost:5001/api/ingredients?where=recipe_id=${r.id}`, {
            method: 'DELETE'
          }).catch(err => console.warn('Failed to delete old ingredients:', err));
          
          // Then, add new ingredients
          for (const ingredient of r.ingredients) {
            if (ingredient.name && ingredient.amount && ingredient.unit) {
              await fetch('http://localhost:5001/api/ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipe_id: r.id,
                  name: ingredient.name,
                  amount: ingredient.amount,
                  unit: ingredient.unit,
                  position: r.ingredients.indexOf(ingredient)
                })
              }).catch(err => console.warn('Failed to add ingredient:', err));
            }
          }
        }
        
        // Update local state
        setRecipes(prev => prev.map(x => (x.id === r.id ? r : x)));
      } catch (error) {
        console.error('Failed to update recipe:', error);
        throw error;
      }
    } else {
      // New recipe - add directly to local state since RecipeFormModal already created it via API
      console.log('Adding recipe to local state:', r.title);
      setRecipes(prev => {
        const newRecipes = [r, ...prev];
        console.log(
          'New recipes order:',
          newRecipes.map(r => r.title)
        );
        return newRecipes;
      });
    }
  }

  async function remove(id: number) {
    await recipeStore.remove(id.toString());
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
    refresh: loadRecipes,
  };
}
