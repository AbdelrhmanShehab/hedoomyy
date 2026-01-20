type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

export default function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="
        w-full rounded-full bg-[#E6A6E9]
        py-4 text-white font-medium
        transition hover:opacity-90
        disabled:opacity-50
      "
    >
      {children}
    </button>
  );
}
