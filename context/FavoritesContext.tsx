"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type FavoritesContextType = {
    favorites: string[];
    ready: boolean;
    toggleFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [ready, setReady] = useState(false);

    // Load from local storage
    useEffect(() => {
        const read = (saved: string | null) => {
            try {
                const value: unknown = JSON.parse(saved || "[]");
                setFavorites(Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && id.length > 0))] : []);
            } catch { setFavorites([]); }
        };
        try { read(localStorage.getItem("favorites")); } catch { /* Storage can be disabled. */ }
        setReady(true);
        const sync = (event: StorageEvent) => { if (event.key === "favorites" || event.key === null) read(event.newValue); };
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (!ready) return;
        try { localStorage.setItem("favorites", JSON.stringify(favorites)); } catch { /* Keep working in memory. */ }
    }, [favorites, ready]);

    const toggleFavorite = (productId: string) => {
        setFavorites((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const isFavorite = (productId: string) => favorites.includes(productId);

    return (
        <FavoritesContext.Provider value={{ favorites, ready, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
};
