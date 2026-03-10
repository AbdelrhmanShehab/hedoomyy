import "./globals.css";
import { CheckoutProvider } from "../context/CheckoutContext";
import { CartProvider } from "../context/CartContext";
import { CartSidebar } from "../components/CardSiderbar";
import { AuthProvider } from "../context/AuthContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { Quicksand } from "next/font/google";
import NotificationManager from "../components/NotificationManager";

const quicksand = Quicksand({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <CheckoutProvider>
                <NotificationManager />
                <main>{children}</main>
                <CartSidebar />
              </CheckoutProvider>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
