import Image from "next/image";
import one from "../../public/1.png";

const products = [
    { id: 1, image: one, title: "Blouse and belted skirt", price: "250 EGP" },
    { id: 2, image: one, title: "Blouse and belted skirt", price: "250 EGP" },
    { id: 3, image: one, title: "Blouse and belted skirt", price: "250 EGP" },
    { id: 4, image: one, title: "Blouse and belted skirt", price: "250 EGP" },
];

export default function BestSeller() {
    return (
        <section className="w-full px-10 py-16">
            {/* Title */}
            <h2 className="mb-6 text-2xl font-medium text-zinc-900">
                Explore Best Seller
            </h2>

            <div className="relative">
                {/* Left Arrow */}
                <button className="absolute left-[-40px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center text-xl text-gray-400 hover:text-black">
                    ‹
                </button>

                {/* Products */}
                <div className="flex gap-16 justify-center">
                    {products.map((product) => (
                        <div key={product.id} className="flex flex-col items-center">
                            {/* Image */}
                            <div className="w-[260px] h-[380px] relative rounded-2xl overflow-hidden">
                                <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Info */}
                            <p className="mt-4 text-sm text-gray-700">
                                {product.title}
                            </p>
                            <p className="text-sm text-pink-400 font-medium">
                                {product.price}
                            </p>

                            {/* Button */}
                            <button className="mt-3 px-6 py-2 rounded-full border border-pink-300 text-pink-400 text-sm flex items-center gap-2 hover:bg-pink-50">
                                🛒 Quick Add
                            </button>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center text-xl text-gray-400 hover:text-black">
                    ›
                </button>
            </div>
        </section>
    );
}
