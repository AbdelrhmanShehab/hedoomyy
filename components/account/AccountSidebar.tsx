"use client";
import { User, MapPin, Package } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export default function AccountSidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: Props) {
  const { t } = useLanguage();
  
  const menuItems = [
    { id: "profile", label: t("account_profile"), icon: User },
    { id: "orders", label: t("account_orders"), icon: Package },
    { id: "addresses", label: t("account_addresses"), icon: MapPin },
  ] as const;

  return (
    <aside className="w-full md:w-60">
      <h2 className="text-lg font-semibold mb-6">{t("account_my_account")}</h2>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2 text-sm text-left transition-all cursor-pointer
                ${isActive ? "border-l-2 border-purple-600 text-purple-600 font-medium" : "text-gray-600 hover:text-black"}
              `}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}

        <button
          onClick={onLogout}
          className="mt-6 text-sm text-red-500 hover:text-red-600 text-left px-3 py-1 cursor-pointer"
        >
          {t("account_sign_out")}
        </button>
      </nav>
    </aside>
  );
}