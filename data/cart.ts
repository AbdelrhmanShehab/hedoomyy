export type CartItem = {
  id: string;
  title: string;
  price: number;   // MUST be number
  qty: number;
  image: string;
  variant?: string;
};
