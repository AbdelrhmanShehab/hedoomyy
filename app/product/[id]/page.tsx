import type { Metadata } from "next";
import { fetchProductById } from "@/lib/firestore-server";
import ProductClient from "./ProductClient";

/* ──────────────────────────────────────────
   generateMetadata — runs at build / request time on the server.
   Fetches the product from Firestore REST API and builds
   per-product Open Graph + Twitter cards + JSON-LD.
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
  const price = product.price as number;
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
   Page — passes the id down to the client component.
────────────────────────────────────────── */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch product for JSON-LD structured data (server-side only)
  const product = await fetchProductById(id);

  const jsonLd = product
    ? {
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
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductClient id={id} />
    </>
  );
}
