export type Ingredient = {
  id: string;
  name: string;
  category: 'produce' | 'protein' | 'grain' | 'dairy' | 'canned' | 'spice' | 'condiment' | 'other';
  caloriesPerUnit?: number;
  unit?: string;
};

export type Recipe = {
  id: string;
  title: string;
  ingredients: Array<{ ingredientId: string; amount: number; unit?: string }>;
  steps: string[];
  tags: string[];
  minutes: number;
  nutrition?: {
    calories: number; protein: number; carbs: number; fat: number;
  };
};

export type PantryItem = { ingredientId: string; amount: number; unit?: string };

export type DayLogEntry = {
  id: string;
  dateISO: string;
  recipeId?: string;
  title: string;
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
};
