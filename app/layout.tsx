import "./globals.css";
import { CheckoutProvider } from "../context/CheckoutContext";
import { CartProvider } from "../context/CartContext";
import { CartSidebar } from "../components/CardSiderbar";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          <CartProvider>
            <CheckoutProvider>
              <main>{children}</main>
              <CartSidebar />
            </CheckoutProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}