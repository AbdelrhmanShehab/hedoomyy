export type Product = {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  category: string;
  isBestSeller: boolean;
  createdAt: number | null; // ✅ timestamp (ms)
  status: string;
  stock: number;
};
