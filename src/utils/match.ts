import { PantryItem, Recipe } from '../types';

export type MatchScore = {
  recipeId: string;
  coverage: number; // 0..1 fraction of ingredients user has
  missing: Array<{ ingredientId: string; amount: number; unit?: string }>;
};

export function scoreRecipe(pantry: PantryItem[], recipe: Recipe): MatchScore {
  const pantryMap = new Map(pantry.map(p => [p.ingredientId, p.amount]));
  let have = 0;
  const missing: Array<{ ingredientId: string; amount: number; unit?: string }> = [];
  for (const need of recipe.ingredients) {
    const haveAmount = pantryMap.get(need.ingredientId) ?? 0;
    if (haveAmount >= (need.amount || 0)) {
      have += 1;
    } else {
      missing.push({ ingredientId: need.ingredientId, amount: Math.max(0, need.amount - haveAmount), unit: need.unit });
    }
  }
  const coverage = recipe.ingredients.length === 0 ? 1 : have / recipe.ingredients.length;
  return { recipeId: recipe.id, coverage, missing };
}

export function rankRecipes(pantry: PantryItem[], recipes: Recipe[]): MatchScore[] {
  return recipes.map(r => scoreRecipe(pantry, r)).sort((a, b) => b.coverage - a.coverage);
}
