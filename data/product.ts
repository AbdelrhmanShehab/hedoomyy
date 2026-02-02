import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  status?: string;
  stock?: number;
  isBestSeller: boolean;
  createdAt: Timestamp | null;
};
