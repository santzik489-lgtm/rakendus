import React, { useMemo, useState } from 'react';
import { INGREDIENTS } from './data/ingredients';
import { RECIPES } from './data/recipes';
import { PantryItem, Recipe, DayLogEntry } from './types';
import { rankRecipes } from './utils/match';

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  React.useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

function formatUnit(unit?: string) {
  return unit ? ` ${unit}` : '';
}

export const App: React.FC = () => {
  const [pantry, setPantry] = useLocalStorage<PantryItem[]>('pantry', []);
  const [query, setQuery] = useState('');
  const [selectedRecipeIds, setSelectedRecipeIds] = useLocalStorage<string[]>('selectedRecipes', []);
  const [premium, setPremium] = useLocalStorage<boolean>('premium', true);
  const [log, setLog] = useLocalStorage<DayLogEntry[]>('calorieLog', []);

  const ingredientOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INGREDIENTS.filter(i => i.name.toLowerCase().includes(q) || i.id.includes(q));
  }, [query]);

  const scores = useMemo(() => rankRecipes(pantry, RECIPES), [pantry]);

  const selectedRecipes = useMemo(() => RECIPES.filter(r => selectedRecipeIds.includes(r.id)), [selectedRecipeIds]);

  const totals = useMemo(() => {
    const nutrition = selectedRecipes.reduce(
      (acc, r) => {
        if (!r.nutrition) return acc;
        return {
          calories: acc.calories + r.nutrition.calories,
          protein: acc.protein + r.nutrition.protein,
          carbs: acc.carbs + r.nutrition.carbs,
          fat: acc.fat + r.nutrition.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    return nutrition;
  }, [selectedRecipes]);

  function addPantry(ingredientId: string) {
    setPantry(prev => {
      const existing = prev.find(p => p.ingredientId === ingredientId);
      if (existing) {
        return prev.map(p => p.ingredientId === ingredientId ? { ...p, amount: p.amount + 1 } : p);
      }
      return [...prev, { ingredientId, amount: 1 }];
    });
    setQuery('');
  }

  function removePantry(ingredientId: string) {
    setPantry(prev => prev.filter(p => p.ingredientId !== ingredientId));
  }

  function toggleSelect(recipeId: string) {
    setSelectedRecipeIds(prev => prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]);
  }

  function addToLogFromRecipe(recipe: Recipe) {
    const now = new Date();
    const entry: DayLogEntry = {
      id: `${now.getTime()}`,
      dateISO: now.toISOString().slice(0, 10),
      recipeId: recipe.id,
      title: recipe.title,
      nutrition: recipe.nutrition ?? { calories: 0, protein: 0, carbs: 0, fat: 0 },
    };
    setLog(prev => [entry, ...prev]);
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayCalories = useMemo(() => log.filter(l => l.dateISO === todayISO).reduce((s, l) => s + l.nutrition.calories, 0), [log, todayISO]);

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Leftover Recipe App</h2>
          <span className="badge">Premium</span>
        </div>
        <div className="kpi">
          <div className="tile"><div className="small">Selected Calories</div><strong>{totals.calories}</strong></div>
          <div className="tile"><div className="small">Today</div><strong>{todayCalories} kcal</strong></div>
          <label className="tile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={premium} onChange={e => setPremium(e.target.checked)} /> Premium
          </label>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Your Pantry</h3>
        <input className="input" placeholder="Add ingredient (e.g. egg, tomato)" value={query} onChange={e => setQuery(e.target.value)} />
        {query && (
          <div className="chips" style={{ marginTop: 8 }}>
            {ingredientOptions.slice(0, 8).map(i => (
              <button key={i.id} className="chip" onClick={() => addPantry(i.id)}>{i.name}</button>
            ))}
          </div>
        )}
        <div className="chips" style={{ marginTop: 12 }}>
          {pantry.map(p => {
            const info = INGREDIENTS.find(i => i.id === p.ingredientId);
            return (
              <span className="chip" key={p.ingredientId}>
                {info?.name ?? p.ingredientId} × {p.amount}
                <button className="button secondary" style={{ marginLeft: 8 }} onClick={() => removePantry(p.ingredientId)}>remove</button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid" style={{ marginBottom: 16 }}>
        {scores.map(s => {
          const recipe = RECIPES.find(r => r.id === s.recipeId)!;
          const selected = selectedRecipeIds.includes(recipe.id);
          return (
            <div className="card" key={recipe.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{recipe.title}</strong>
                <span className="small">{Math.round(s.coverage * 100)}% match</span>
              </div>
              <div className="small" style={{ marginTop: 6 }}>{recipe.minutes} min · {recipe.tags.join(', ')}</div>
              <div className="small" style={{ marginTop: 8 }}>Ingredients:</div>
              <ul style={{ marginTop: 6 }}>
                {recipe.ingredients.map(ing => {
                  const info = INGREDIENTS.find(i => i.id === ing.ingredientId);
                  const have = pantry.find(p => p.ingredientId === ing.ingredientId)?.amount ?? 0;
                  const missing = Math.max(0, (ing.amount || 0) - have);
                  const needText = `${info?.name ?? ing.ingredientId}: ${ing.amount}${formatUnit(ing.unit)}`;
                  return (
                    <li key={ing.ingredientId} className="small" style={{ color: missing > 0 ? '#ff9a9a' : undefined }}>
                      {needText} {missing > 0 ? `(need ${missing}${formatUnit(ing.unit)})` : '(have)'}
                    </li>
                  );
                })}
              </ul>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button" onClick={() => toggleSelect(recipe.id)}>{selected ? 'Remove' : 'Select'}</button>
                {premium && (
                  <button className="button secondary" onClick={() => addToLogFromRecipe(recipe)}>Log calories</button>
                )}
              </div>
              {premium && recipe.nutrition && (
                <div className="kpi" style={{ marginTop: 10 }}>
                  <div className="tile small">kcal {recipe.nutrition.calories}</div>
                  <div className="tile small">P {recipe.nutrition.protein}g</div>
                  <div className="tile small">C {recipe.nutrition.carbs}g</div>
                  <div className="tile small">F {recipe.nutrition.fat}g</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Shopping List</h3>
        <ShoppingList pantry={pantry} selectedRecipes={selectedRecipes} />
      </div>

      {premium && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Calorie Counter</h3>
          <CalorieCounter log={log} onRemove={(id) => setLog(prev => prev.filter(e => e.id !== id))} />
        </div>
      )}

      <footer className="small" style={{ textAlign: 'center', opacity: .8 }}>Built with Vite + React. Data stored locally.</footer>
    </div>
  );
};

const ShoppingList: React.FC<{ pantry: PantryItem[]; selectedRecipes: Recipe[] }> = ({ pantry, selectedRecipes }) => {
  const needs = useMemo(() => {
    const needMap = new Map<string, { amount: number; unit?: string }>();
    for (const recipe of selectedRecipes) {
      for (const ing of recipe.ingredients) {
        const have = pantry.find(p => p.ingredientId === ing.ingredientId)?.amount ?? 0;
        const missing = Math.max(0, (ing.amount || 0) - have);
        if (missing > 0) {
          const prev = needMap.get(ing.ingredientId) ?? { amount: 0, unit: ing.unit };
          needMap.set(ing.ingredientId, { amount: prev.amount + missing, unit: ing.unit ?? prev.unit });
        }
      }
    }
    return Array.from(needMap.entries()).map(([ingredientId, v]) => ({ ingredientId, ...v }));
  }, [pantry, selectedRecipes]);

  if (needs.length === 0) return <div className="small">No missing ingredients for selected recipes.</div>;

  return (
    <ul>
      {needs.map(n => {
        const info = INGREDIENTS.find(i => i.id === n.ingredientId);
        return <li key={n.ingredientId}>{info?.name ?? n.ingredientId}: {n.amount}{formatUnit(n.unit)}</li>;
      })}
    </ul>
  );
};

const CalorieCounter: React.FC<{ log: DayLogEntry[]; onRemove: (id: string) => void }> = ({ log, onRemove }) => {
  const todayISO = new Date().toISOString().slice(0, 10);
  const grouped = useMemo(() => {
    const map = new Map<string, { total: number; entries: DayLogEntry[] }>();
    for (const entry of log) {
      const day = entry.dateISO;
      const prev = map.get(day) ?? { total: 0, entries: [] };
      prev.total += entry.nutrition.calories;
      prev.entries.push(entry);
      map.set(day, prev);
    }
    return Array.from(map.entries()).sort((a,b) => b[0].localeCompare(a[0]));
  }, [log]);

  return (
    <div>
      {grouped.map(([day, { total, entries }]) => (
        <div key={day} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{day}{day === todayISO ? ' (today)' : ''}</strong>
            <span className="small">{total} kcal</span>
          </div>
          <ul style={{ marginTop: 6 }}>
            {entries.map(e => (
              <li key={e.id} className="small" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{e.title} — {e.nutrition.calories} kcal</span>
                <button className="button secondary" onClick={() => onRemove(e.id)}>remove</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
