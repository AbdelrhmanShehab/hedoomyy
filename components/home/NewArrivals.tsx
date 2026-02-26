import Image from "next/image";
import { Product } from "@/data/product";

interface Props {
  products: Product[];
}

export default function NewArrivals({ products }: Props) {
  if (products.length === 0) return null;

  const [bigProduct, ...smallProducts] = products;

  return (
    <section className="w-full px-5 py-10">
      <h2 className="mb-6 text-2xl font-medium">
        Explore New Arrivals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* BIG PRODUCT */}
        <div className="relative group h-[400px] md:h-[650px]">
          <Image
            src={bigProduct.images?.[0] ?? "/1.png"}
            alt={bigProduct.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-lg"
          />

          {bigProduct.variants?.every(v => v.stock === 0) && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white rounded-lg">
              Sold Out
            </div>
          )}
        </div>

        {/* SMALL PRODUCTS */}
        <div className="grid grid-cols-2 gap-4 h-[400px] md:h-[650px]">
          {smallProducts.map(product => {
            const totalStock =
              product.variants?.reduce(
                (sum, v) => sum + (v.stock || 0),
                0
              ) ?? 0;

            const isSold = totalStock === 0;

            return (
              <div key={product.id} className="relative group h-full">
                <Image
                  src={product.images?.[0] ?? "/1.png"}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover rounded-lg"
                />

                {isSold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white rounded-lg">
                    Sold Out
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
