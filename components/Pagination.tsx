"use client";

type Props = {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
};

export default function Pagination({ page, totalPages, setPage }: Props) {
  return (
    <div className="flex justify-center gap-2 mt-12">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`w-9 h-9 rounded-full border text-sm ${
            page === i + 1
              ? "bg-pink-400 text-white"
              : "text-gray-600"
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
