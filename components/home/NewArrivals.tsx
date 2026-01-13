"use client";

import Image from "next/image";
import one from "../../public/1.png";

const products = [
    { id: 2001, image: one, price: 600 },
    { id: 2002, image: one, price: 500 },
    { id: 2003, image: one, price: 400 },
    { id: 2004, image: one, price: 700 },
    { id: 2005, image: one, price: 500 },
];

export default function NewArrivals() {
    return (
        <section className="px-6 py-20">
            {/* Title */}
            <h2 className="mb-6 text-2xl font-medium text-zinc-900">
                New Arrivals
            </h2>

            <div className="flex gap-4">
                {/* Left big image */}
                <div className="group relative h-[520px] w-1/2 overflow-hidden rounded-xl">
                    <Image
                        src={products[0].image}
                        alt={`Product ${products[0].id}`}
                        fill
                        className="object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 hidden bg-black/40 group-hover:block" />

                    {/* Price + Button */}
                    <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-center text-white group-hover:block">
                        <h3 className="mb-4 text-3xl font-light">
                            {products[0].price} EGP
                        </h3>

                        <button className="rounded border border-white px-6 py-2 text-sm font-medium transition hover:bg-white hover:text-black">
                            Add to Basket
                        </button>
                    </div>
                </div>

                {/* Right grid */}
                <div className="grid h-[520px] w-1/2 grid-cols-2 gap-4">
                    {products.slice(1).map((product) => (
                        <div
                            key={product.id}
                            className="group relative overflow-hidden rounded-xl"
                        >
                            <Image
                                src={product.image}
                                alt={`Product ${product.id}`}
                                fill
                                className="object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 hidden bg-black/40 group-hover:block" />

                            {/* Price + Button */}
                            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-center text-white group-hover:block">
                                <h3 className="mb-3 text-xl font-light">
                                    {product.price} EGP
                                </h3>

                                <button className="rounded border border-white px-5 py-2 text-sm font-medium transition hover:bg-white hover:text-black">
                                    Add to Basket
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
