import ProductSlider from "../../components/ProductSlider";
import { Product } from "../../data/product";

interface Props {
  products: Product[];
}

export default function BestSeller({ products }: Props) {
  return (
    <section className="w-full px-5 py-16">
      <h2 className="mb-3 md:mb-6 text-xl md:text-2xl font-semibold text-zinc-900">
        Best Sellers
      </h2>
      <ProductSlider products={products} />
    </section>
  );
}
