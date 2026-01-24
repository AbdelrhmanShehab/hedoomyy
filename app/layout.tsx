import "./globals.css";
import { CheckoutProvider } from "../context/CheckoutContext";
import  { CartProvider } from "../context/CartContext";
import { CartSidebar } from "../components/CardSiderbar";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <CartProvider>
          <CheckoutProvider>
            <main>{children}</main>
            <CartSidebar />
          </CheckoutProvider>
        </CartProvider>
      </body>
    </html>
  );
}