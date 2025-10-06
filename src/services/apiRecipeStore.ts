import type { IRecipeStore } from "./IRecipeStore.ts";
import type { Recipe } from "../types/recipe.ts";
import { apiClient } from "./apiClient.ts";

export class ApiRecipeStore implements IRecipeStore {
  async list() {
    return apiClient.get<Recipe[]>('/api/recipes');
  }

  async create(rec: Recipe) {
    // Clean recipe data - only send database fields
    const cleanRecipe = {
      user_id: rec.user_id,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      cook_time_min: rec.cook_time_min,
      difficulty: rec.difficulty,
      image_url: rec.image_url,
    };

    return apiClient.post<Recipe>('/api/recipes', cleanRecipe);
  }

  async update(rec: Recipe) {
    return apiClient.put<Recipe>(`/api/recipes/${rec.id}`, rec);
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/recipes/${id}`);
  }

  async importMany(rs: Recipe[]) {
    await Promise.all(rs.map(x => this.create(x)));
  }

  async clear() { 
    // Can be implemented as needed 
  }
}
