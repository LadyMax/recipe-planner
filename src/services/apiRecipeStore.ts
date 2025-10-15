import type { IRecipeStore } from "./IRecipeStore.ts";
import type { Recipe } from "../types/recipe.ts";
import { apiClient } from "./apiClient.ts";

export class ApiRecipeStore implements IRecipeStore {
  async list(userRole?: string, userId?: number) {
    // Determine query parameters based on user role
    if (userRole === 'admin') {
      // Admin can see all recipes
      return apiClient.get<Recipe[]>('/api/recipes');
    } else if (userId) {
      // Regular users can only see their own recipes
      return apiClient.get<Recipe[]>(`/api/recipes?where=created_by=${userId}`);
    } else {
      // Unauthenticated users see no recipes
      return [];
    }
  }

  async create(rec: Recipe, userId?: number) {
    // Prepare recipe data for backend storage
    const cleanRecipe = {
      created_by: userId || rec.created_by || 3, // Use current user ID or default to user 3 (Thomas)
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
