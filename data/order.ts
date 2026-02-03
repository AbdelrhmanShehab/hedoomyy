export type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image: string;
  variant?: string;
};

export type Order = {
  items: OrderItem[];
  customer: {
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
  };
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  status: string;
  createdAt: any;
};
