import type { Recipe } from "../types/recipe.ts";

export type AggregatedItem = { name: string; amounts: string[]; count: number };

export function aggregateIngredients(recipes: Recipe[]): AggregatedItem[] {
  const map = new Map<string, AggregatedItem>();
  const norm = (s: string) => s.trim().toLowerCase();

  for (const r of recipes) {
    // Check if recipe has ingredients field
    if (r.ingredients && Array.isArray(r.ingredients)) {
      for (const ing of r.ingredients) {
        const key = norm(ing.name);
        const item = map.get(key) || { name: ing.name.trim(), amounts: [], count: 0 };
        item.count += 1;
        if (ing.amount && !item.amounts.includes(ing.amount)) item.amounts.push(ing.amount);
        map.set(key, item);
      }
    }
  }
  return Array.from(map.values()).sort((a,b)=>a.name.localeCompare(b.name));
}
