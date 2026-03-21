export type ProductStatus = "active" | "inactive";

export interface ProductVariant {
  id: string; // unique id for variant

  color: string;
  size: string;

  stock: number; // stock per size + color
}

export interface Product {
  id: string;

  title: string;
  description: string;

  category: string;

  price: number;

  status: ProductStatus;
  isBestSeller: boolean;

  originalPrice?: number;
  offerId?: string;

  images: string[];
  shareCount?: number;

  variants: ProductVariant[];
  averageRating?: number;
  reviewCount?: number;

  createdAt?: any;
  updatedAt?: any;
}
