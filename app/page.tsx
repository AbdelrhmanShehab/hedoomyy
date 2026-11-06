import { sectionVisibility } from "@/lib/home-sections";
import { fetchHomeSections } from "@/lib/firestore-server";
import Image from "next/image";
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
import WholeLook from "@/components/home/WholeLook";
import CatalogRetry from "@/components/home/CatalogRetry";
import { loadHomeData } from "@/lib/home-data";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Hedoomyy",
  description:
    "Shop affordable women's clothing online in Egypt. Discover new arrivals, best sellers, dresses, tops and more. Fast delivery across Cairo and all of Egypt.",
  alternates: {
    canonical: "https://hedoomyy.co",
  },
  openGraph: {
    url: "https://hedoomyy.co",
    title: "Hedoomyy",
    description:
      "Shop affordable women's clothing online in Egypt. Discover new arrivals, best sellers, dresses, tops and more. Fast delivery across Cairo and all of Egypt.",
  },
};

export default async function Home() {
  const visible = sectionVisibility(await fetchHomeSections());
  // Keep the storefront available if one or more catalog requests fail.
  const { categories, newArrivals, bestSellers, unavailable } = await loadHomeData({
    categories: () => visible.categories ? fetchCategories() : Promise.resolve([]),
    newArrivals: () => visible.newArrivals ? fetchNewArrivals(5) : Promise.resolve([]),
    bestSellers: () => visible.bestSellers ? fetchBestSellers(8) : Promise.resolve([]),
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://hedoomyy.co/#website",
        url: "https://hedoomyy.co",
        name: "Hedoomyy",
        description:
          "Online clothing store based in Cairo, Egypt. Quality fashion at affordable prices.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://hedoomyy.co/products?category={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": "https://hedoomyy.co/#organization",
        name: "Hedoomyy",
        url: "https://hedoomyy.co",
        logo: {
          "@type": "ImageObject",
          url: "https://hedoomyy.co/footerhedoomyy.png",
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
      {visible.banner && <Image
        src={hedoomyybanner}
        className="   h-[35vh] md:h-[60vh] lg:h-[70vh]  w-full object-fit "
        alt="Hedoomyy — Online Fashion Store in Egypt"
        sizes="100vw"
      />}
      <main className="mainContainer">
        {unavailable && <CatalogRetry />}
        {visible.hero && <ErrorBoundary fallback={null}>
          <Hero />
        </ErrorBoundary>}
        {visible.categories && <ErrorBoundary fallback={null}>
          <Categories categories={categories} />
        </ErrorBoundary>}
        {visible.wholeLook && <ErrorBoundary fallback={null}>
          <WholeLook />
        </ErrorBoundary>}
        {visible.newArrivals && <ErrorBoundary fallback={null}>
          <NewArrivals products={newArrivals as Product[]} />
        </ErrorBoundary>}
        {visible.bestSellers && <ErrorBoundary fallback={null}>
          <BestSeller products={bestSellers as Product[]} />
        </ErrorBoundary>}
        {visible.feedback && <ErrorBoundary fallback={null}>
          <Feedback />
        </ErrorBoundary>}
        {visible.instagram && <ErrorBoundary fallback={null}>
          <InstagramFeed />
        </ErrorBoundary>}
      </main>
      <Footer />
    </div>
  );
}
