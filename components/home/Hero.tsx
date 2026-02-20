import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="max-w-2xl text-3xl font-medium leading-snug text-zinc-900 md:text-4xl">
        Because looking good shouldn’t cost a fortune
      </h1>

      <Link
        href="/products"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-[#E3A5E7] px-10 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Shop All
      </Link>
    </section>
  );
}
