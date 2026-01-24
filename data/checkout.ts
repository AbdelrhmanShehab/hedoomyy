import { CartItem } from "./cart";

export type CheckoutOrder = {
  items: CartItem[];

  contact: {
    email: string;
  };

  delivery: {
    address: string;
    phone: string;
  };

  payment: "cod" | "online";
};
