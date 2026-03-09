import "./globals.css";
import { CheckoutProvider } from "../context/CheckoutContext";
import { CartProvider } from "../context/CartContext";
import { CartSidebar } from "../components/CardSiderbar";
import { AuthProvider } from "../context/AuthContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { Quicksand } from "next/font/google";

import { NotificationProvider } from "../context/NotificationContext";

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={quicksand.className}>
        <AuthProvider>
          <NotificationProvider>
            <FavoritesProvider>
              <CartProvider>
                <CheckoutProvider>
                  <main>{children}</main>
                  <CartSidebar />
                </CheckoutProvider>
              </CartProvider>
            </FavoritesProvider>
          </NotificationProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
