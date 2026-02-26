import CategoryCard from "./CategoryCard";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
};

interface Props {
  categories: Category[];
}

export default function Categories({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <section className="py-10">
      <h2 className="mb-6 text-xl font-medium text-zinc-900">
        Explore Categories
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
        {categories.map(cat => (
          <CategoryCard
            key={cat.id}
            title={`Shop ${cat.name}`}
            image={cat.image || "/placeholder.jpg"}
            href={`/products?category=${cat.slug}`}
          />
        ))}
      </div>
    </section>
  );
}
