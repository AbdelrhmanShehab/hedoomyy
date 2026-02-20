import ProductGrid from "../../components/ProductGrid";
import { Product } from "../../data/product";

interface Props {
  products: Product[];
}

export default function BestSeller({ products }: Props) {
  return (
    <section className="w-full px-5 py-16">
      <h2 className="mb-6 text-2xl font-medium">
        Explore Best Seller
      </h2>
      <ProductGrid products={products} />
    </section>
  );
}
