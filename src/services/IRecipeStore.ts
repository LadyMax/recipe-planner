import type { Recipe } from "../types/recipe.ts";

export interface IRecipeStore {
  list(): Promise<Recipe[]>;
  create(r: Recipe): Promise<Recipe>;
  update(r: Recipe): Promise<Recipe>;
  remove(id: string): Promise<void>;
  importMany(rs: Recipe[]): Promise<void>;
  clear(): Promise<void>;
}
