import { CartItem } from "./cart";

export type CheckoutOrder = {
  items: CartItem[];

  contact: {
    email: string;
  };

  delivery: {
    address: string;
    phone: string;

    firstName: string;
    lastName: string;

    secondPhone?: string;

    city: string;
    government: string;
    apartment?: string;
  };

  payment: "cod" | "online";
};
