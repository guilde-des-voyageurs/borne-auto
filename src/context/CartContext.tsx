'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  title: string;
  variantTitle: string;
  price: string;
  quantity: number;
  image: string;
  weight: number;
  weight_unit: string;
}

interface CartState {
  items: { [variantId: string]: CartItem };
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { variantId: string } & CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { variantId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: {},
  total: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { variantId, ...item } = action.payload;
      const existingItem = state.items[variantId];

      const updatedItems = {
        ...state.items,
        [variantId]: existingItem
          ? { ...existingItem, quantity: existingItem.quantity + item.quantity }
          : item,
      };

      const total = Object.entries(updatedItems).reduce(
        (sum, [_, item]) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        total,
      };
    }

    case 'REMOVE_ITEM': {
      const variantId = action.payload;
      const { [variantId]: removed, ...updatedItems } = state.items;

      const total = Object.entries(updatedItems).reduce(
        (sum, [_, item]) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        total,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { variantId, quantity } = action.payload;
      if (quantity <= 0) {
        const { [variantId]: removed, ...updatedItems } = state.items;
        
        const total = Object.entries(updatedItems).reduce(
          (sum, [_, item]) => sum + parseFloat(item.price) * item.quantity,
          0
        );

        return {
          ...state,
          items: updatedItems,
          total,
        };
      }

      const updatedItems = {
        ...state.items,
        [variantId]: {
          ...state.items[variantId],
          quantity,
        },
      };

      const total = Object.entries(updatedItems).reduce(
        (sum, [_, item]) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        total,
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const { items, total } = JSON.parse(savedCart);
      dispatch({ type: 'CLEAR_CART' });
      Object.entries(items).forEach(([variantId, item]) => {
        dispatch({
          type: 'ADD_ITEM',
          payload: {
            variantId,
            ...item as CartItem
          }
        });
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

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
