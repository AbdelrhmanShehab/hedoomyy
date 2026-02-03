// data/checkout.ts

export type CheckoutItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  image: string;
  variant?: string;
};

export type CheckoutOrder = {
  items: CheckoutItem[];

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
