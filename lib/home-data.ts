import type { Product } from "@/data/product";

type Category = { id: string; name: string; slug: string; image?: string };
type Loaders = {
  categories: () => Promise<Category[]>;
  newArrivals: () => Promise<Product[]>;
  bestSellers: () => Promise<Product[]>;
};

export async function loadHomeData(loaders: Loaders) {
  const keys = ["categories", "newArrivals", "bestSellers"] as const;
  const results = await Promise.allSettled([
    Promise.resolve().then(loaders.categories),
    Promise.resolve().then(loaders.newArrivals),
    Promise.resolve().then(loaders.bestSellers),
  ]);
  const failed: string[] = [];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      failed.push(keys[index]);
      console.error(`Homepage ${keys[index]} unavailable:`, result.reason);
    }
  });
  return {
    categories: results[0].status === "fulfilled" ? results[0].value : [],
    newArrivals: results[1].status === "fulfilled" ? results[1].value : [],
    bestSellers: results[2].status === "fulfilled" ? results[2].value : [],
    unavailable: failed.length > 0,
  };
}
