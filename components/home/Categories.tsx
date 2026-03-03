import CategorySlider from "../CategorySlider";

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
    <section className="py-10 px-5">
      <h2 className="mb-3 md:mb-6 text-xl md:text-2xl font-semibold text-zinc-900">
        Categories
      </h2>

      <CategorySlider categories={categories} />
    </section>
  );
}