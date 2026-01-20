type Props = {
  value: string;
  options: string[];
  onChange: (val: string) => void;
};

export default function ColorSelector({ value, options, onChange }: Props) {
  return (
    <div>
      <p className="text-sm mb-2">Choose Color:</p>
      <div className="flex gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              value === opt
                ? "bg-purple-300 text-white border-purple-300"
                : "border-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
