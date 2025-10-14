export type Ingredient = {
  id: number | string;
  name: string;
  amount?: number;
  unit?: string;
};

export type RecipeIngredient = {
  id: number;
  recipe_id: number;
  ingredient_category_id: number;
  amount?: number;
  unit?: string;
  // Joined data from ingredient_categories
  ingredient_name?: string;
  ingredient_category?: string;
};

export type Recipe = {
  id: number;
  // Database fields
  created_by?: number; // Database field name
  recipe_name?: string; // Database field name
  description?: string;
  category?: string; // Category field (e.g., "Soup", "Main Course")
  image_url?: string;
  meal_type_id?: number; // Database field name
  recipe_ingredients?: RecipeIngredient[];
  user_id?: number; // Maps to created_by
  // For backward compatibility with old ingredients structure
  ingredients?: Ingredient[];
};

export type RecipeComment = {
  id: number;
  recipeId: number;
  userId: number;
  userName: string;
  content: string;
};


