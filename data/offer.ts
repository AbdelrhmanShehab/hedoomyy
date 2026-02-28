export type OfferType = "product" | "category" | "all";

export interface Offer {
    id: string;
    name: string;
    type: OfferType;
    targetId?: string; // if type is "product", this is the product ID. If type is "category", this is the category ID (or slug).
    discountPercentage: number;
    isActive: boolean;
    createdAt?: any;
}
