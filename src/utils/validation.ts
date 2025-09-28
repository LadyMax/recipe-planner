import type { Recipe } from "../types/recipe.ts";

export function validateRecipe(r: Recipe): string | null {
  if (!r.name?.trim()) return "Name is required";
  if (!r.ingredients?.length || !r.ingredients.some(i => i.name?.trim()))
    return "At least one ingredient is required";
  return null;
}
