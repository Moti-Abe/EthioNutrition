import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { MealBuilderItem, MealBuilderState } from '../types';
import { calculateNutrition } from '../utils/nutrition';
import {
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  clearDraftFromLocalStorage,
  generateTempId,
} from '../utils/storage';
import type { Food, FoodNutrition } from '../types';

type MealBuilderAction =
  | { type: 'ADD_ITEM'; food: Food; nutrition: FoodNutrition; grams: number }
  | { type: 'REMOVE_ITEM'; tempId: string }
  | { type: 'UPDATE_GRAMS'; tempId: string; grams: number }
  | { type: 'SET_NAME'; name: string }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; state: MealBuilderState };

function reducer(state: MealBuilderState, action: MealBuilderAction): MealBuilderState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const item: MealBuilderItem = {
        tempId: generateTempId(),
        food: action.food,
        nutrition: action.nutrition,
        grams: action.grams,
        computed: calculateNutrition(action.nutrition, action.grams),
      };
      return { ...state, items: [...state.items, item] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.tempId !== action.tempId) };
    case 'UPDATE_GRAMS':
      return {
        ...state,
        items: state.items.map((i) =>
          i.tempId === action.tempId
            ? {
                ...i,
                grams: action.grams,
                computed: calculateNutrition(i.nutrition, action.grams),
              }
            : i
        ),
      };
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'CLEAR':
      return { items: [], name: '' };
    case 'LOAD':
      return action.state;
    default:
      return state;
  }
}

interface MealBuilderContextValue {
  state: MealBuilderState;
  addItem: (food: Food, nutrition: FoodNutrition, grams: number) => void;
  removeItem: (tempId: string) => void;
  updateGrams: (tempId: string, grams: number) => void;
  setName: (name: string) => void;
  clear: () => void;
}

const MealBuilderContext = createContext<MealBuilderContextValue | undefined>(undefined);

export function MealBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], name: '' }, () => {
    return loadDraftFromLocalStorage() ?? { items: [], name: '' };
  });

  // Persist draft on every change
  useEffect(() => {
    saveDraftToLocalStorage(state);
  }, [state]);

  const addItem = (food: Food, nutrition: FoodNutrition, grams: number) =>
    dispatch({ type: 'ADD_ITEM', food, nutrition, grams });

  const removeItem = (tempId: string) => dispatch({ type: 'REMOVE_ITEM', tempId });

  const updateGrams = (tempId: string, grams: number) =>
    dispatch({ type: 'UPDATE_GRAMS', tempId, grams });

  const setName = (name: string) => dispatch({ type: 'SET_NAME', name });

  const clear = () => {
    dispatch({ type: 'CLEAR' });
    clearDraftFromLocalStorage();
  };

  return (
    <MealBuilderContext.Provider value={{ state, addItem, removeItem, updateGrams, setName, clear }}>
      {children}
    </MealBuilderContext.Provider>
  );
}

export function useMealBuilder(): MealBuilderContextValue {
  const ctx = useContext(MealBuilderContext);
  if (!ctx) throw new Error('useMealBuilder must be used within MealBuilderProvider');
  return ctx;
}
