export type Ingredient = {
  id: number;
  name: string;
  amount?: string;
  unit?: string;
};

export type Recipe = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  cook_time_min?: number;
  difficulty?: string;
  image_url?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  // Compatibility fields
  ingredients?: Ingredient[];
  instructions?: string;
  tags?: string[];
  imageUrl?: string;
  servings?: number;
  durationMins?: number;
  authorId?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type RecipeComment = {
  id: number;
  recipeId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
};

