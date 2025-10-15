import type { Recipe } from "../types/recipe.ts";

export interface IRecipeStore {
  list(userRole?: string, userId?: number): Promise<Recipe[]>;
  create(r: Recipe, userId?: number): Promise<Recipe>;
  update(r: Recipe): Promise<Recipe>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}
