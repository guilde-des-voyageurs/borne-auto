'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  productId: string;
  title: string;
  variantTitle: string;
  price: string;
  quantity: number;
  image: string;
}

interface CartState {
  items: { [variantId: string]: CartItem };
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { variantId: string; item: CartItem } }
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
      const { variantId, item } = action.payload;
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
      const { [action.payload]: removedItem, ...remainingItems } = state.items;
      
      const total = Object.entries(remainingItems).reduce(
        (sum, [_, item]) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        items: remainingItems,
        total,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { variantId, quantity } = action.payload;
      
      if (quantity <= 0) {
        const { [variantId]: removedItem, ...remainingItems } = state.items;
        const total = Object.entries(remainingItems).reduce(
          (sum, [_, item]) => sum + parseFloat(item.price) * item.quantity,
          0
        );
        return {
          ...state,
          items: remainingItems,
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

  // Persistance du panier dans le localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.items && Object.keys(parsedCart.items).length > 0) {
        Object.entries(parsedCart.items).forEach(([variantId, item]) => {
          dispatch({
            type: 'ADD_ITEM',
            payload: { variantId, item: item as CartItem },
          });
        });
      }
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
