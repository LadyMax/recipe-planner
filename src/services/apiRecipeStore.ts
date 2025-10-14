import type { IRecipeStore } from "./IRecipeStore.ts";
import type { Recipe } from "../types/recipe.ts";
import { apiClient } from "./apiClient.ts";

export class ApiRecipeStore implements IRecipeStore {
  async list() {
    return apiClient.get<Recipe[]>('/api/recipes');
  }

  async create(rec: Recipe) {
    // Clean recipe data - map to React-Rapide backend fields
    const cleanRecipe = {
      created_by: rec.created_by || 3, // Default to user 3 (Thomas)
      recipe_name: rec.recipe_name || '',
      description: rec.description || '',
      image_url: rec.image_url || '', // Default image
      meal_type_id: rec.meal_type_id || 1, // Default meal type
      category: rec.category || '',
    };

    return apiClient.post<Recipe>('/api/recipes', cleanRecipe);
  }

  async update(rec: Recipe) {
    // Map to React-Rapide backend fields
    const cleanRecipe = {
      id: rec.id,
      created_by: rec.created_by || 3,
      recipe_name: rec.recipe_name || '',
      description: rec.description || '',
      image_url: rec.image_url || '',
      meal_type_id: rec.meal_type_id || 1,
      category: rec.category || '',
    };

    return apiClient.put<Recipe>(`/api/recipes/${rec.id}`, cleanRecipe);
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/recipes/${id}`);
  }


  async clear() { 
    // Can be implemented as needed 
  }
}
