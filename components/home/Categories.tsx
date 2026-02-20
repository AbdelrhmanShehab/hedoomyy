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
    <section className="pb-20">
      <h2 className="mb-8 text-xl font-medium text-zinc-900">
        Explore Categories
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
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
