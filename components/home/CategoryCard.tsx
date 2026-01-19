"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  image: string;
  href: string;
};

export default function CategoryCard({ title, image, href }: Props) {
  return (
    <Link
      href={href}
      className="group block w-[240px] flex-shrink-0"
    >
      <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-zinc-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <p className="mt-3 text-sm text-zinc-700">
        {title} →
      </p>
    </Link>
  );
}
