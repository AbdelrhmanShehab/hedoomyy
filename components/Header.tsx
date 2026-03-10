"use client";

import Image from "next/image";
import Link from "next/link";
import { User, ShoppingBag, Menu, X, Heart, Bell } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useMemo, useState, memo } from "react";
import useCategories from "../usecategories";
import callIcon from "../public/calIIcon.svg";
import instagramIcon from "../public/instagramIcon.svg";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

interface Order {
  id: string;
  status: string;
  createdAt: any;
  totals?: { total: number };
  delivery?: { city: string; firstName: string; lastName: string; phone: string };
}

export default function Header() {
  const { categories } = useCategories();
  const { items, openCart } = useCart();
  const { user, userData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* --- NOTIFICATION LOGIC --- */
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const [notifications, setNotifications] = useState<Order[]>([]);

  const isAdmin = userData?.role === "admin";

  // Audio Unlock for Mobile
  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.01; 
      audio.play().then(() => {
        setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 100);
        window.removeEventListener("click", unlockAudio, true);
        window.removeEventListener("touchstart", unlockAudio, true);
      }).catch(() => {});
    };
    window.addEventListener("click", unlockAudio, true);
    window.addEventListener("touchstart", unlockAudio, true);
    return () => {
      window.removeEventListener("click", unlockAudio, true);
      window.removeEventListener("touchstart", unlockAudio, true);
    };
  }, []);

  // Initialize Last Seen
  useEffect(() => {
    const saved = localStorage.getItem("lastSeenOrderTime");
    if (saved) setLastSeen(parseInt(saved));
    else {
      const now = Date.now();
      setLastSeen(now);
      localStorage.setItem("lastSeenOrderTime", now.toString());
    }
  }, []);

  // Real-time Orders Listener (Admins Only)
  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setNotifications(newNotifs);

      if (newNotifs.length > 0 && lastSeen > 0) {
        const newest = newNotifs[0];
        const createdAt = newest.createdAt?.toMillis() || 0;
        if (createdAt > lastSeen) {
          // Play Sound
          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {});

          // Browser Notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🛒 New Order", {
              body: `Order #${newest.id.slice(0, 6).toUpperCase()}\nTotal: ${newest.totals?.total || 0} EGP`,
              icon: "/icons/sidebar-icon.svg",
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [user, isAdmin, lastSeen]);

  const pendingCount = useMemo(() => {
    return notifications.filter(n => {
      const isPending = n.status === "pending";
      const createdAt = n.createdAt?.toMillis() || 0;
      return isPending && createdAt > lastSeen;
    }).length;
  }, [notifications, lastSeen]);

  const handleToggleNotifications = () => {
    const newest = notifications[0]?.createdAt?.toMillis() || Date.now();
    if (!showNotifications) {
      setShowNotifications(true);
      setLastSeen(newest);
      localStorage.setItem("lastSeenOrderTime", newest.toString());
    } else {
      setShowNotifications(false);
    }
  };
  /* --- END NOTIFICATION LOGIC --- */

  const cartCount = items.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-gray-400 text-white text-sm font-bold">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">

          {/* Left Side */}
          <div className="flex items-center gap-6">
            <a href="tel:+01141088386" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src={callIcon} alt="Call" width={16} height={16} />
              <span className="hidden sm:inline">+01141088386</span>
            </a>
            <Link href="https://www.instagram.com/hedoomyy/" target="_blank">
              <span className="flex items-center gap-2 ">
                <Image src={instagramIcon} alt="Instagram" width={16} height={16} />
                <span className="font-bold">Hedoomyy</span>
              </span>
            </Link>
          </div>

          {/* Center Text */}
          <span className="hidden md:block text-s ">
            Enjoy your shopping :)
          </span>

          {/* Right Side */}
          <div className="flex items-center gap-3 text-s">
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-3">
              <a href="/policy" className="hover:underline">FAQs</a>
              <span className="text-white/60">|</span>
              <a href="/policy" className="hover:underline">Return & Exchange</a>
              <span className="text-white/60">|</span>
              <a href="/policy" className="hover:underline">Delivery</a>
            </div>
            {/* Mobile Link */}
            <div className="md:hidden">
              <Link href="/policy" className="hover:underline font-bold">Our Policy</Link>
            </div>
          </div>

        </div>
      </div>

      {/* Main Nav */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -ml-2 text-gray-700"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <Link href="/products" className="hover:text-black transition-colors">All Items</Link>

            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="capitalize text-gray-700 hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <Link href="/account" className="flex items-center justify-center">
              {user ? (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <span className="text-gray-700 font-bold text-sm uppercase">
                    {(user.displayName || user.email || "?")[0]}
                  </span>
                </div>
              ) : (
                <User className="w-5 h-5 text-gray-700 hover:text-black transition-colors" />
              )}
            </Link>

            {isAdmin && (
              <div className="relative">
                <button
                  onClick={handleToggleNotifications}
                  className="p-1 hover:bg-gray-100 rounded-full transition-all relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-700 hover:text-purple-500 transition-colors" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-gray-900">Recent Orders</h3>
                        {pendingCount > 0 && <span className="text-[10px] font-bold text-rose-500 uppercase">{pendingCount} New</span>}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-400 text-xs">No recent orders</div>
                        ) : (
                          notifications.map(notif => (
                            <Link
                              key={notif.id}
                              href="/account"
                              onClick={() => setShowNotifications(false)}
                              className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-none transition-colors"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-gray-900">#{notif.id.slice(0, 6).toUpperCase()}</span>
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${notif.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {notif.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 truncate">
                                ${notif.totals?.total} EGP — ${notif.delivery?.city}
                              </p>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <Link href="/favorites" className="relative p-1 hover:bg-gray-100 rounded-full transition-all">
              <Heart className="w-5 h-5 text-gray-700 hover:text-pink-400 transition-colors" />
            </Link>

            <div className="relative">
              <button
                onClick={openCart}
                className="p-1 hover:bg-gray-100 rounded-full transition-all active:scale-95"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5 h-5 cart-icon text-gray-700 hover:text-black" />
              </button>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full pointer-events-none">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[116px] bg-black/40 z-30 md:hidden backdrop-blur-[2px]"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl z-40 md:hidden">
            <nav className="flex flex-col p-6 gap-5">
              <Link
                href="/"
                className="text-lg font-medium text-gray-900 border-b border-gray-50 pb-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-lg font-medium text-gray-900 border-b border-gray-50 pb-2"
                onClick={() => setIsMenuOpen(false)}
              >
                All Items
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="capitalize text-lg font-medium text-gray-700 hover:text-black border-b border-gray-50 pb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
