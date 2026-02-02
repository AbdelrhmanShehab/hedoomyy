// src/data/cart.ts

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  quantity: number;
};
