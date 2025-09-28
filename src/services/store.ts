import { LocalRecipeStore } from "./localRecipeStore.ts";
// import { ApiRecipeStore } from "./apiRecipeStore.ts";

export const recipeStore =
  // import.meta.env.VITE_USE_API === "1" ? new ApiRecipeStore() :
  new LocalRecipeStore();
