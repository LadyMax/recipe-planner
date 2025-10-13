import type { IRecipeStore } from "./IRecipeStore.ts";
import type { Recipe } from "../types/recipe.ts";

const KEY = "recipe-planner:recipes";

function read(): Recipe[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Recipe[]; } catch { return []; }
}
function write(data: Recipe[]) { localStorage.setItem(KEY, JSON.stringify(data)); }

export class LocalRecipeStore implements IRecipeStore {
  async list() { return read(); }
  async create(r: Recipe) {
    const all = read(); all.unshift(r); write(all); return r;
  }
  async update(r: Recipe) {
    const next = read().map(x => x.id === r.id ? r : x); write(next); return r;
  }
  async remove(id: string) {
    const next = read().filter(x => x.id !== parseInt(id)); write(next);
  }
  async clear() { write([]); }
}
