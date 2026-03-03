import Link from "next/link";
import ProductSlider from "../../components/ProductSlider";
import { Product } from "../../data/product";

interface Props {
  products: Product[];
}

export default function BestSeller({ products }: Props) {
  const displayedProducts = products.slice(0, 7);

  return (
    <section className="w-full px-5 py-16">
      <div className="flex items-baseline justify-between mb-3 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-zinc-900">
          Best Sellers
        </h2>
        <Link
          href="/products?sort=best"
          className="text-sm font-medium text-zinc-600 hover:text-black transition-colors underline underline-offset-4"
        >
          See More
        </Link>
      </div>
      <ProductSlider products={displayedProducts} />
    </section>
  );
}
