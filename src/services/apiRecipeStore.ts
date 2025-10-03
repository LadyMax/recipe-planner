import type { IRecipeStore } from "./IRecipeStore.ts";
import type { Recipe } from "../types/recipe.ts";

const base = ""; // Use Vite proxy

export class ApiRecipeStore implements IRecipeStore {
  async list() {
    const r = await fetch(`${base}/api/recipes`, {
      credentials: 'include'
    });
    if (!r.ok) throw new Error("GET /api/recipes failed");
    return r.json();
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

    const r = await fetch(`${base}/api/recipes`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(cleanRecipe)
    });
    if (!r.ok) throw new Error("POST /api/recipes failed");
    return r.json();
  }
  async update(rec: Recipe) {
    const r = await fetch(`${base}/api/recipes/${rec.id}`, {
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(rec)  
    });
    if (!r.ok) throw new Error("PUT /api/recipes failed");
    return r.json();
  }
  async remove(id: string) {

    const r = await fetch(`${base}/api/recipes/${id}`, { 
      method: "DELETE",
      credentials: 'include'
    });
    if (!r.ok) throw new Error("DELETE /api/recipes failed");
  }
  async importMany(rs: Recipe[]) {
    await Promise.all(rs.map(x => this.create(x)));
  }
  async clear() { /* Can be implemented as needed */ }
}
