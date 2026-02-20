import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import NewArrivals from "@/components/home/NewArrivals";
import hedoomyybanner from "../public/hedoomyybanner.png";
import BestSeller from "@/components/home/BestSeller";
import Feedback from "@/components/home/Feedback";
import {
  fetchCategories,
  fetchNewArrivals,
  fetchBestSellers,
} from "@/lib/firestore-server";
import { Product } from "@/data/product";

export default async function Home() {
  // All three fetches run in PARALLEL — no waterfall
  const [categories, newArrivals, bestSellers] = await Promise.all([
    fetchCategories(),
    fetchNewArrivals(5),
    fetchBestSellers(8),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Image
        src={hedoomyybanner}
        className="md:h-[70vh] h-[76vh] w-full md:object-cover"
        alt="Hedoomyy banner"
        priority
        sizes="100vw"
      />
      <main className="flex-grow container">
        <Hero />
        <Categories categories={categories} />
        <NewArrivals products={newArrivals as Product[]} />
        <BestSeller products={bestSellers as Product[]} />
        <Feedback />
      </main>
      <Footer />
    </div>
  );
}
