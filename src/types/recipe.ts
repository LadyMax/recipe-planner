export type Ingredient = {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  tags?: string[];
  imageUrl?: string;
  servings?: number;
  durationMins?: number;
  category?: string;
  rating?: number;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RecipeComment = {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
};

export type RecipeRating = {
  id: string;
  recipeId: string;
  userId: string;
  rating: number; // 1-5
  createdAt: string;
};
