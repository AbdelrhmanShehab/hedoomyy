import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import NewArrivals from "@/components/home/NewArrivals";
import hedoomyybanner from "../public/hedoomyybanner.png";
import BestSeller from "@/components/home/BestSeller";
import Feedback from "@/components/home/Feedback";
import InstagramFeed from "@/components/InstagramFeed";
import {
  fetchCategories,
  fetchNewArrivals,
  fetchBestSellers,
} from "@/lib/firestore-server";
import { Product } from "@/data/product";
import type { Metadata } from "next";
import Script from "next/script";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Hedoomyy",
  description:
    "Shop affordable women's clothing online in Egypt. Discover new arrivals, best sellers, dresses, tops and more. Fast delivery across Cairo and all of Egypt.",
  alternates: {
    canonical: "https://hedoomyy.com",
  },
  openGraph: {
    url: "https://hedoomyy.com",
    title: "Hedoomyy",
    description:
      "Shop affordable women's clothing online in Egypt. Discover new arrivals, best sellers, dresses, tops and more. Fast delivery across Cairo and all of Egypt.",
  },
};

export default async function Home() {
  // All three fetches run in PARALLEL — no waterfall
  const [categories, newArrivals, bestSellers] = await Promise.all([
    fetchCategories(),
    fetchNewArrivals(5),
    fetchBestSellers(8),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://hedoomyy.com/#website",
        url: "https://hedoomyy.com",
        name: "Hedoomyy",
        description:
          "Online clothing store based in Cairo, Egypt. Quality fashion at affordable prices.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://hedoomyy.com/products?category={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": "https://hedoomyy.com/#organization",
        name: "Hedoomyy",
        url: "https://hedoomyy.com",
        logo: {
          "@type": "ImageObject",
          url: "https://hedoomyy.com/footerhedoomyy.png",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+201141088386",
          contactType: "customer service",
          areaServed: "EG",
          availableLanguage: ["Arabic", "English"],
        },
        sameAs: [
          "https://www.instagram.com/hedoomyy/",
          "https://www.tiktok.com/@hedoomyy",
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Script
        id="home-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <Image
        src={hedoomyybanner}
        className="   h-[35vh] md:h-[60vh] lg:h-[70vh]  w-full object-fit "
        alt="Hedoomyy — Online Fashion Store in Egypt"
        sizes="100vw"
      />
      <main className="mainContainer">
        <ErrorBoundary fallback={null}>
          <Hero />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <Categories categories={categories} />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <NewArrivals products={newArrivals as Product[]} />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <BestSeller products={bestSellers as Product[]} />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <Feedback />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <InstagramFeed />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
