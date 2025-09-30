import type { IRecipeStore } from "./IRecipeStore.ts";
import type { Recipe } from "../types/recipe.ts";

const base = "http://localhost:5001"; // Direct connection to backend

export class ApiRecipeStore implements IRecipeStore {
  async list() {
    const r = await fetch(`${base}/api/recipes`);
    if (!r.ok) throw new Error("GET /api/recipes failed");
    return r.json();
  }
  async create(rec: Recipe) {
    const r = await fetch(`${base}/api/recipes`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rec)
    });
    if (!r.ok) throw new Error("POST /api/recipes failed");
    return r.json();
  }
  async update(rec: Recipe) {
    const r = await fetch(`${base}/api/recipes/${rec.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rec)
    });
    if (!r.ok) throw new Error("PUT /api/recipes failed");
    return r.json();
  }
  async remove(id: string) {
    const r = await fetch(`${base}/api/recipes/${id}`, { method: "DELETE" });
    if (!r.ok) throw new Error("DELETE /api/recipes failed");
  }
  async importMany(rs: Recipe[]) {
    await Promise.all(rs.map(x => this.create(x)));
  }
  async clear() { /* Can be implemented as needed */ }
}
