import { useEffect, useState } from 'react';
import type { Recipe, RecipeIngredient, Ingredient } from '../types/recipe.ts';
import { recipeStore } from '../services/store.ts';
import { validateRecipe } from '../utils/validation.ts';
import { useAuth } from './useAuth';

export function useRecipes() {
  const { isAuthenticated, user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        // Use localStorage when not authenticated
        const localRecipes = localStorage.getItem('demo-recipes');
        if (localRecipes) {
          try {
            const parsedRecipes = JSON.parse(localRecipes);

            if (parsedRecipes.length > 0 && parsedRecipes[0].recipe_name && /[\u4e00-\u9fff]/.test(parsedRecipes[0].recipe_name)) {
              localStorage.removeItem('demo-recipes');
              setRecipes([]);
            } else {
              // Deep copy parsed recipes to avoid reference issues
              const deepCopiedRecipes = parsedRecipes.map((recipe: Recipe) => ({
                ...recipe,
                ingredients: recipe.ingredients ? recipe.ingredients.map((ing: Ingredient) => ({ ...ing })) : undefined
              }));
              setRecipes(deepCopiedRecipes);
            }
          } catch {
            localStorage.removeItem('demo-recipes');
            setRecipes([]);
          }
        } else {
          setRecipes([]);
        }
        setLoading(false);
        return;
      }

      // Pass user role and ID to recipeStore
      const data = await recipeStore.list(user?.role, user?.id);
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data);
        setRecipes([]);
        return;
      }

      // Filter out empty objects (when table has no data)
      const validData = data.filter(item => 
        item && 
        typeof item === 'object' && 
        Object.keys(item).length > 0 && 
        item.id !== undefined
      );
      
      if (validData.length === 0) {
        console.log('No valid recipes found in API response');
        setRecipes([]);
        return;
      }

      // Retrieve ingredients data for each recipe
      const recipesWithIngredients = await Promise.all(
        validData.map(async (recipe: Recipe) => {
          
          // Validate recipe has required fields
          if (!recipe || typeof recipe !== 'object' || !recipe.id) {
            console.error('Recipe missing ID or invalid:', recipe);
            return null;
          }
          
          // Map React-Rapide fields to frontend fields
          const mappedRecipe: Recipe = {
            ...recipe,
            recipe_name: recipe.recipe_name,
            user_id: recipe.created_by,
            image_url: recipe.image_url,
            category: recipe.category,
          };
          
          try {
            // Load recipe ingredients from the recipe_ingredients table
            const ingredientsResponse = await fetch(`/api/recipe_ingredients?where=recipe_id=${recipe.id}`, {
              credentials: 'include'
            });
            if (ingredientsResponse.ok) {
              const ingredientsData = await ingredientsResponse.json();
              mappedRecipe.recipe_ingredients = ingredientsData;
              
              // Also populate legacy ingredients field for backward compatibility
              // load ingredient names from ingredient_categories table
              const ingredientsWithNames = await Promise.all(
                ingredientsData.map(async (ri: RecipeIngredient) => {
                  try {
                    const ingredientResponse = await fetch(`/api/ingredient_categories/${ri.ingredient_category_id}`, {
                      credentials: 'include'
                    });
                    if (ingredientResponse.ok) {
                      const ingredientData = await ingredientResponse.json();
                      return {
                        id: ri.ingredient_category_id,
                        name: ingredientData.name || '',
                        amount: ri.amount || 0,
                        unit: ri.unit || ''
                      };
                    }
                  } catch (error) {
                    console.warn(`Failed to fetch ingredient name for ID ${ri.ingredient_category_id}:`, error);
                  }
                  // Fallback if we can't load the ingredient name
                  return {
                    id: ri.ingredient_category_id,
                    name: `Ingredient ${ri.ingredient_category_id}`,
                    amount: ri.amount || 0,
                    unit: ri.unit || ''
                  };
                })
              );
              
              mappedRecipe.ingredients = ingredientsWithNames;
            } else {
              console.warn(`Failed to fetch ingredients for recipe ${recipe.id}:`, ingredientsResponse.status);
              mappedRecipe.recipe_ingredients = [];
              mappedRecipe.ingredients = [];
            }
          } catch (error) {
            console.warn(`Failed to fetch ingredients for recipe ${recipe.id}:`, error);
            mappedRecipe.recipe_ingredients = [];
            mappedRecipe.ingredients = [];
          }
          return mappedRecipe;
        })
      );
      
      // Filter out null recipes
      const validRecipes = recipesWithIngredients.filter((recipe): recipe is Recipe => recipe !== null);
      
      
      setRecipes(validRecipes);
    } catch (e: unknown) {
      setError((e as Error)?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function upsert(r: Recipe) {
    const err = validateRecipe(r);
    if (err) throw new Error(err);

    if (!isAuthenticated) {
      // Use localStorage when not authenticated
      const exists = recipes.some(x => x.id === r.id);
      if (exists) {
        // Update existing recipe
        const updatedRecipes = recipes.map(x => (x.id === r.id ? r : x));
        setRecipes(updatedRecipes);
        localStorage.setItem('demo-recipes', JSON.stringify(updatedRecipes));
      } else {
        // Add new recipe
        const newRecipes = [...recipes, r];
        setRecipes(newRecipes);
        localStorage.setItem('demo-recipes', JSON.stringify(newRecipes));
      }
      return;
    }

    const exists = recipes.some(x => x.id === r.id);
    if (exists) {
      // Update existing recipe - map to React-Rapide fields
      const dbRecipe = {
        id: r.id,
        created_by: r.created_by || 1,
        recipe_name: r.recipe_name || '',
        description: r.description || '',
        imagePath: r.image_url || '',
        instructions: r.description || '',
        meal_type_id: r.meal_type_id || 1,
        category: r.category || '',
        image_url: r.image_url || ''
      };
      
      try {
        // Update recipe in database
        await recipeStore.update(dbRecipe);
        
        // Update ingredients if they exist
        if (r.ingredients && r.ingredients.length > 0) {
          // First, get all existing recipe ingredients and delete them individually
          try {
            const existingIngredientsResponse = await fetch(`/api/recipe_ingredients?where=recipe_id=${r.id}`, {
              credentials: 'include'
            });
            
            if (existingIngredientsResponse.ok) {
              const existingIngredients = await existingIngredientsResponse.json();
              
              // Delete each existing recipe ingredient individually
              for (const existingIngredient of existingIngredients) {
                await fetch(`/api/recipe_ingredients/${existingIngredient.id}`, {
                  method: 'DELETE',
                  credentials: 'include'
                }).catch(err => console.warn('Failed to delete existing recipe ingredient:', err));
              }
            }
          } catch (error) {
            console.warn('Failed to fetch existing recipe ingredients:', error);
          }
          
          // Then, add new recipe ingredients
          for (const ingredient of r.ingredients) {
            if (ingredient.name && ingredient.amount) {
              // Use ingredient ID directly (assuming ingredient.id is the ingredient_category_id)
              await fetch('/api/recipe_ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  recipe_id: r.id,
                  ingredient_category_id: ingredient.id,
                  amount: ingredient.amount,
                  unit: ingredient.unit
                })
              }).catch(err => console.warn('Failed to add recipe ingredient:', err));
            }
          }
        }
        
        // Update local state - create a new object to avoid reference issues
        setRecipes(prev => prev.map(x => 
          x.id === r.id 
            ? { 
                ...r, 
                ingredients: r.ingredients ? r.ingredients.map(ing => ({ ...ing })) : undefined 
              } 
            : x
        ));
      } catch (error) {
        console.error('Failed to update recipe:', error);
        throw error;
      }
    } else {
      // New recipe - create via API first
      try {
        const createdRecipe = await recipeStore.create(r, user?.id);
        
        // Add ingredients if they exist
        if (r.ingredients && r.ingredients.length > 0) {
          // Get the recipe ID from the created recipe response
          const recipeId = (createdRecipe as { insertId?: number; id?: number }).insertId || (createdRecipe as { insertId?: number; id?: number }).id;
          for (const ingredient of r.ingredients) {
            if (ingredient.name && ingredient.amount) {
              // Use ingredient ID directly (assuming ingredient.id is the ingredient_category_id)
              const ingredientData = {
                recipe_id: recipeId,
                ingredient_category_id: ingredient.id,
                amount: ingredient.amount,
                unit: ingredient.unit
              };
              
              await fetch('/api/recipe_ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(ingredientData)
              }).catch(err => console.warn('Failed to add recipe ingredient:', err));
            }
          }
        }
        
        // Reload recipes to get the complete updated list
        await loadRecipes();
      } catch (error) {
        console.error('Failed to create recipe:', error);
        throw error;
      }
    }
  }

  async function remove(id: number) {
    if (!isAuthenticated) {
      // Use localStorage when not authenticated
      const updatedRecipes = recipes.filter(x => x.id !== id);
      setRecipes(updatedRecipes);
      localStorage.setItem('demo-recipes', JSON.stringify(updatedRecipes));
      return;
    }
    
    try {
      // First, get all recipe_ingredients for this recipe
      const recipeIngredientsResponse = await fetch(`/api/recipe_ingredients?where=recipe_id=${id}`, {
        credentials: 'include'
      });
      
      if (recipeIngredientsResponse.ok) {
        const recipeIngredients = await recipeIngredientsResponse.json();
        
        // Delete each recipe_ingredient individually
        for (const recipeIngredient of recipeIngredients) {
          await fetch(`/api/recipe_ingredients/${recipeIngredient.id}`, {
            method: 'DELETE',
            credentials: 'include'
          }).catch(err => console.warn('Failed to delete recipe ingredient:', err));
        }
      }
      
      
      // Then delete the recipe
      await recipeStore.remove(id.toString());
      setRecipes(prev => prev.filter(x => x.id !== id));
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      throw error;
    }
  }


  return {
    recipes,
    loading,
    error,
    setError,
    upsert,
    remove,
    refresh: loadRecipes,
  };
}
