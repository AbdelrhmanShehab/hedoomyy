export type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image: string;
  variant?: string;
};

export type Order = {
  coupon?: { code: string; discountAmount: number };
  items: OrderItem[];
  contact: {
    email: string;
    phone: string;
  };
  delivery: {
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    apartment?: string;
    city: string;
    government: string;
    secondPhone?: string;
  };
  payment: {
    method: "cod" | "online";
    paid: boolean;
    depositType?: "deposit" | "full"; // COD → "deposit" (10%), online → "full" (total)
    depositAmount?: number;            // amount to be collected/confirmed
    paymentPhotoUrl?: string;          // Instapay screenshot URL (Firebase Storage)
  };
  totals: {
    discount?: number;
    subtotal: number;
    shipping: number;
    total: number;
  };
  status: string;
  createdAt: any;
};
