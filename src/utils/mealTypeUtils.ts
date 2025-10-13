// Utility functions for meal type handling

export const MEAL_TYPES = {
  1: 'Breakfast',
  2: 'Lunch', 
  3: 'Dinner',
  4: 'Snack',
  5: 'Dessert'
} as const;

export type MealTypeId = keyof typeof MEAL_TYPES;

export function getMealTypeName(mealTypeId: number | undefined): string {
  if (!mealTypeId || !MEAL_TYPES[mealTypeId as MealTypeId]) {
    return 'Meal';
  }
  return MEAL_TYPES[mealTypeId as MealTypeId];
}

export function getMealTypeOptions() {
  return Object.entries(MEAL_TYPES).map(([id, name]) => ({
    value: id,
    label: name
  }));
}
