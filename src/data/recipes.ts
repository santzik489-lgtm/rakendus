import { Recipe } from '../types';

export const RECIPES: Recipe[] = [
  {
    id: 'omelette',
    title: 'Cheese Omelette',
    minutes: 10,
    tags: ['breakfast', 'quick'],
    ingredients: [
      { ingredientId: 'egg', amount: 2, unit: 'unit' },
      { ingredientId: 'cheese', amount: 30, unit: 'g' },
      { ingredientId: 'butter', amount: 5, unit: 'g' },
      { ingredientId: 'salt', amount: 1, unit: 'pinch' },
      { ingredientId: 'pepper', amount: 1, unit: 'pinch' },
    ],
    steps: [
      'Beat eggs with salt and pepper',
      'Melt butter in pan, pour eggs',
      'Add cheese, fold, and serve',
    ],
    nutrition: { calories: 300, protein: 20, carbs: 2, fat: 24 },
  },
  {
    id: 'tomato-pasta',
    title: 'Tomato Garlic Pasta',
    minutes: 20,
    tags: ['dinner', 'vegetarian'],
    ingredients: [
      { ingredientId: 'pasta', amount: 160, unit: 'g' },
      { ingredientId: 'tomato', amount: 200, unit: 'g' },
      { ingredientId: 'garlic', amount: 10, unit: 'g' },
      { ingredientId: 'olive-oil', amount: 10, unit: 'ml' },
      { ingredientId: 'salt', amount: 1, unit: 'tsp' },
    ],
    steps: [
      'Boil pasta',
      'Saute garlic and tomatoes in oil',
      'Combine and season',
    ],
    nutrition: { calories: 520, protein: 15, carbs: 90, fat: 12 },
  },
  {
    id: 'chicken-rice-bowl',
    title: 'Chicken Rice Bowl',
    minutes: 25,
    tags: ['high-protein'],
    ingredients: [
      { ingredientId: 'rice', amount: 200, unit: 'g' },
      { ingredientId: 'chicken', amount: 200, unit: 'g' },
      { ingredientId: 'onion', amount: 100, unit: 'g' },
      { ingredientId: 'olive-oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 1, unit: 'tsp' },
      { ingredientId: 'pepper', amount: 1, unit: 'tsp' },
    ],
    steps: [
      'Cook rice',
      'Saute onion, cook chicken',
      'Combine and season',
    ],
    nutrition: { calories: 700, protein: 55, carbs: 80, fat: 18 },
  },
  {
    id: 'bean-salad',
    title: 'Bean and Tomato Salad',
    minutes: 10,
    tags: ['quick', 'no-cook'],
    ingredients: [
      { ingredientId: 'beans', amount: 200, unit: 'g' },
      { ingredientId: 'tomato', amount: 150, unit: 'g' },
      { ingredientId: 'onion', amount: 50, unit: 'g' },
      { ingredientId: 'olive-oil', amount: 5, unit: 'ml' },
      { ingredientId: 'salt', amount: 1, unit: 'tsp' },
      { ingredientId: 'pepper', amount: 1, unit: 'tsp' },
    ],
    steps: [
      'Chop vegetables',
      'Mix beans and vegetables',
      'Dress with oil and season',
    ],
    nutrition: { calories: 350, protein: 18, carbs: 40, fat: 12 },
  },
];
