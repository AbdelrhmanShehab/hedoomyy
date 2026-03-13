import type { Metadata } from "next";
import FavoritesClient from "./FavoritesClient";

export const metadata: Metadata = {
  title: "Your Favorites",
  description: "View and manage your saved favourite items at Hedoomyy. Find everything you love in one place and add them to your cart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}