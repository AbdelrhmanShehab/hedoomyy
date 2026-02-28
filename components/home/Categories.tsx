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
      <h2 className="mb-6 text-2xl font-medium text-zinc-900">
        Explore Categories
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 w-full">
        {categories.slice(0, 5).map(cat => (
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