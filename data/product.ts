export type Product = {
  id: string;
  name: string; // ← was title
  price: number;
  imageUrl: string | null; // ← was image
  category: string;
  status?: string;
  stock?: number;
  isBestSeller: boolean;
};
