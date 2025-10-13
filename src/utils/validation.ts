// Import type { Recipe } from "../types/recipe.ts";

export function validateRecipe(r: any): string | null {
  if (!r.recipe_name?.trim()) return "Recipe name is required";
  // For recipes returned from API, ingredients field may be missing, this is normal
  // Only need to validate ingredients when creating new recipes
  if (r.ingredients && (!r.ingredients.length || !r.ingredients.some((i: any) => i.name?.trim())))
    return "At least one ingredient is required";
  return null;
}
