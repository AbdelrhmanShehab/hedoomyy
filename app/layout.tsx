import "./globals.css";
import { CheckoutProvider } from "../context/CheckoutContext";
import { CartProvider } from "../context/CartContext";
import { CartSidebar } from "../components/CardSiderbar";
import { AuthProvider } from "../context/AuthContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { Quicksand, Cairo } from "next/font/google";
import NotificationManager from "../components/NotificationManager";
import { LanguageProvider } from "../context/LanguageContext";
import type { Metadata } from "next";

const quicksand = Quicksand({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quicksand",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hedoomyy.com"),
  title: {
    default: "Hedoomyy | Online Fashion Store in Egypt",
    template: "%s | Hedoomyy",
  },
  description:
    "Hedoomyy is an online clothing store based in Cairo, Egypt. Discover quality fashion pieces — dresses, tops, and more — at affordable prices. Fast delivery across Egypt.",
  keywords: [
    "hedoomyy",
    "online clothing store Egypt",
    "fashion Egypt",
    "women clothing Cairo",
    "affordable fashion Egypt",
    "online shopping Egypt",
    "Egyptian fashion brand",
    "buy clothes online Egypt",
    "hedomy",
    "hedoomy",
  ],
  authors: [{ name: "Hedoomyy", url: "https://hedoomyy.com" }],
  creator: "Hedoomyy",
  publisher: "Hedoomyy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hedoomyy.com",
    siteName: "Hedoomyy | For Her",
    title: "Hedoomyy | Online Fashion Store in Egypt",
    description:
      "Discover quality fashion pieces at affordable prices. Fast delivery across Egypt.",
    images: [
      {
        url: "/hedoomyybanner.png",
        width: 1200,
        height: 630,
        alt: "Hedoomyy — Online Fashion Store in Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hedoomyy | For Her",
    description:
      "Discover quality fashion pieces at affordable prices. Fast delivery across Egypt.",
    images: ["/hedoomyybanner.png"],
    creator: "@hedoomyy",
  },
  alternates: {
    canonical: "https://hedoomyy.com",
  },
  category: "fashion",
  icons: {
    icon: "/black-icon.png",
    apple: "/black-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} ${cairo.variable} font-sans`}>
        <LanguageProvider>
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
        </LanguageProvider>
      </body>
    </html>
  );
}

