"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  image: string;
  href: string;
};

export default function CategoryCard({ title, image, href }: Props) {
  // 🛡️ Data Guard: Handle missing/invalid title
  if (!title || typeof title !== "string") return null;

  // Extract just the category name from "Shop CategoryName" if needed
  const displayName = title.replace("Shop ", "");

  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 w-full flex-shrink-0"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-zinc-100 border-2 border-transparent group-hover:border-pink-200 transition-all duration-300 min-w-[100px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <p className="text-[12px] md:text-sm font-bold text-zinc-600 text-center truncate w-full px-1">
        {displayName}
      </p>
    </Link>
  );
}