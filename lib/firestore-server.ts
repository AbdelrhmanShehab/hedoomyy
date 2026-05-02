/**
 * Server-side Firestore helpers using the Firestore REST API.
 * These can be used in async Server Components without the Firebase client SDK.
 */

const PROJECT_ID = "hedoomyy";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ---------- Generic helpers ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseValue(value: any): any {
    if (!value) return null;
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.integerValue !== undefined) return Number(value.integerValue);
    if (value.doubleValue !== undefined) return Number(value.doubleValue);
    if (value.booleanValue !== undefined) return value.booleanValue;
    if (value.nullValue !== undefined) return null;
    if (value.timestampValue !== undefined)
        return new Date(value.timestampValue).getTime();
    if (value.arrayValue)
        return (value.arrayValue.values ?? []).map(parseValue);
    if (value.mapValue)
        return parseFields(value.mapValue.fields ?? {});
    return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFields(fields: Record<string, any>): Record<string, any> {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
        result[key] = parseValue(val);
    }
    return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToObject(doc: any) {
    const id = doc.name?.split("/").pop() ?? "";
    const fields = parseFields(doc.fields ?? {});
    return { id, ...fields };
}

// ---------- Query helpers ----------

async function runQuery(body: object) {
    const res = await fetch(`${BASE_URL}:runQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        next: { revalidate: 60 }, // cache for 60 seconds
    });

    if (!res.ok) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = await res.json();
    return data
        .filter((d) => d.document)
        .map((d) => docToObject(d.document));
}

async function listCollection(collection: string) {
    const res = await fetch(`${BASE_URL}/${collection}`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    return (data.documents ?? []).map(docToObject);
}

// ---------- Domain queries ----------

export async function fetchCategories() {
    return listCollection("categories");
}

/** All active products — used by /api/products route */
export async function fetchActiveProducts() {
    return runQuery({
        structuredQuery: {
            from: [{ collectionId: "products" }],
            where: {
                fieldFilter: {
                    field: { fieldPath: "status" },
                    op: "EQUAL",
                    value: { stringValue: "active" },
                },
            },
        },
    });
}

/** Reviews for a single product — used by /api/reviews route */
export async function fetchReviewsByProduct(productId: string) {
    return runQuery({
        structuredQuery: {
            from: [{ collectionId: "reviews" }],
            where: {
                fieldFilter: {
                    field: { fieldPath: "productId" },
                    op: "EQUAL",
                    value: { stringValue: productId },
                },
            },
        },
    });
}

export async function fetchNewArrivals(limitCount = 5) {
    return runQuery({
        structuredQuery: {
            from: [{ collectionId: "products" }],
            where: {
                compositeFilter: {
                    op: "AND",
                    filters: [
                        {
                            fieldFilter: {
                                field: { fieldPath: "status" },
                                op: "EQUAL",
                                value: { stringValue: "active" },
                            },
                        },
                    ],
                },
            },
            orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
            limit: limitCount,
        },
    });
}

export async function fetchBestSellers(limitCount = 8) {
    return runQuery({
        structuredQuery: {
            from: [{ collectionId: "products" }],
            where: {
                compositeFilter: {
                    op: "AND",
                    filters: [
                        {
                            fieldFilter: {
                                field: { fieldPath: "status" },
                                op: "EQUAL",
                                value: { stringValue: "active" },
                            },
                        },
                        {
                            fieldFilter: {
                                field: { fieldPath: "isBestSeller" },
                                op: "EQUAL",
                                value: { booleanValue: true },
                            },
                        },
                    ],
                },
            },
            limit: limitCount,
        },
    });
}

export async function fetchProductById(id: string) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = await res.json();
    if (!doc.fields) return null;
    return docToObject(doc) as Record<string, any>;
}

export async function fetchRelatedProducts(categoryId: string, currentProductId: string, limitCount = 4) {
    if (!categoryId) return [];
    
    // Fetch active products in the same category
    return runQuery({
        structuredQuery: {
            from: [{ collectionId: "products" }],
            where: {
                compositeFilter: {
                    op: "AND",
                    filters: [
                        {
                            fieldFilter: {
                                field: { fieldPath: "status" },
                                op: "EQUAL",
                                value: { stringValue: "active" },
                            },
                        },
                        {
                            fieldFilter: {
                                field: { fieldPath: "category" },
                                op: "EQUAL",
                                value: { stringValue: categoryId },
                            },
                        },
                    ],
                },
            },
            limit: limitCount + 1, // Get one extra to account for potentially filtering out the current product
        },
    }).then(products => products.filter(p => p.id !== currentProductId).slice(0, limitCount));
}

/** Fetch website settings — used for maintenance mode */
export async function fetchWebsiteSettings() {
    const res = await fetch(`${BASE_URL}/settings/website`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) return { isActive: true };
    const doc: any = await res.json();
    return parseFields(doc.fields ?? {});
}

/** Fetch user document by UID */
export async function fetchUserById(uid: string) {
    const res = await fetch(`${BASE_URL}/users/${uid}`, {
        cache: "no-store",
    });
    if (!res.ok) return null;
    const doc: any = await res.json();
    return parseFields(doc.fields ?? {});
}

/** Fetch all cities for checkout */
export async function fetchCities() {
    return listCollection("cities");
}

/** Fetch products by a list of IDs — used for favorites */
export async function fetchProductsByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];

    // The REST API doesn't have a direct 'in' operator for document IDs in a simple way like the SDK.
    // We can fetch them in parallel or use a more complex runQuery.
    // Let's use parallel fetch for simplicity since favorites lists are usually small.
    const promises = ids.map(id => fetchProductById(id));
    const results = await Promise.all(promises);
    return results.filter(p => p !== null);
}

/** Fetch orders for a user */
export async function fetchUserOrders(uid: string) {
    return runQuery({
        structuredQuery: {
            from: [{ collectionId: "orders" }],
            where: {
                fieldFilter: {
                    field: { fieldPath: "userId" },
                    op: "EQUAL",
                    value: { stringValue: uid },
                },
            },
            orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
        },
    });
}
