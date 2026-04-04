import type { Metadata } from "next";
import { fetchProductById, fetchRelatedProducts } from "@/lib/firestore-server";
import ProductClient from "./ProductClient";
import { Product } from "@/data/product";
import { notFound } from "next/navigation";

/* ──────────────────────────────────────────
   generateMetadata — runs at build / request time on the server.
   Fetches the product from Firestore REST API and builds
   per-product Open Graph + Twitter cards + JSON-LD.
   Next.js 15+ Params are a Promise.
────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = product.title as string;
  const description =
    (product.description as string)?.slice(0, 155) ||
    `Shop ${title} at Hedoomyy — quality fashion at affordable prices. Fast delivery across Egypt.`;
  const images = (product.images as string[]) ?? [];
  const ogImage = images[0] ?? "/hedoomyybanner.png";
  const canonicalUrl = `https://hedoomyy.com/product/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `${title} | Hedoomyy`,
      description,
      images: [
        {
          url: ogImage,
          width: 800,
          height: 1067,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Hedoomyy`,
      description,
      images: [ogImage],
    },
  };
}

/* ──────────────────────────────────────────
   Page — passes product and related products to client component.
────────────────────────────────────────── */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch both product and related products in parallel
  const product = await fetchProductById(id);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = await fetchRelatedProducts(product.category as string, id, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || "",
    image: (product.images as string[]) ?? [],
    url: `https://hedoomyy.com/product/${id}`,
    brand: {
      "@type": "Brand",
      name: "Hedoomyy",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: product.price,
      availability:
        product.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Hedoomyy",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient product={product as Product} relatedProducts={relatedProducts as Product[]} />
    </>
  );
}
