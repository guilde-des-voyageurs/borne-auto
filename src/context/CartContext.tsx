'use client';

import React, { createContext, useContext, useReducer } from 'react';

export interface CartItem {
  variantId: string;
  title: string;
  variant: string;
  price: string;
  quantity: number;
  weight: number;
  weight_unit: string;
}

interface CartState {
  items: {
    [variantId: string]: CartItem;
  };
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { variantId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}>({
  state: { items: {} },
  dispatch: () => null,
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items[action.payload.variantId];
      if (existingItem) {
        return {
          ...state,
          items: {
            ...state.items,
            [action.payload.variantId]: {
              ...existingItem,
              quantity: existingItem.quantity + action.payload.quantity,
            },
          },
        };
      }
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.variantId]: action.payload,
        },
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = { ...state.items };
      delete newItems[action.payload];
      return {
        ...state,
        items: newItems,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { variantId, quantity } = action.payload;
      const item = state.items[variantId];
      if (!item) return state;

      return {
        ...state,
        items: {
          ...state.items,
          [variantId]: {
            ...item,
            quantity,
          },
        },
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: {},
      };

    default:
      return state;
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: {} });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
