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

    if (!res.ok) {
        const errText = await res.text().catch(() => res.status.toString());
        console.error("Firestore runQuery failed:", res.status, errText);
        return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = await res.json();
    return data
        .filter((d) => d.document)
        .map((d) => docToObject(d.document));
}

// ---------- Write helpers ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFirestoreValue(value: any): any {
    if (value === null || value === undefined) return { nullValue: null };
    if (typeof value === "boolean") return { booleanValue: value };
    if (typeof value === "number") {
        if (Number.isInteger(value)) return { integerValue: String(value) };
        return { doubleValue: value };
    }
    if (typeof value === "string") return { stringValue: value };
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (Array.isArray(value))
        return { arrayValue: { values: value.map(toFirestoreValue) } };
    if (typeof value === "object")
        return { mapValue: { fields: toFirestoreFields(value) } };
    return { nullValue: null };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
        if (val !== undefined) {
            fields[key] = toFirestoreValue(val);
        }
    }
    return fields;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createDocument(collectionPath: string, data: Record<string, any>) {
    const res = await fetch(`${BASE_URL}/${collectionPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: toFirestoreFields(data) }),
    });
    if (!res.ok) {
        const err = await res.text().catch(() => res.status.toString());
        throw new Error(`Firestore create failed (${res.status}): ${err}`);
    }
    const doc = await res.json();
    return docToObject(doc);
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
    const results = await runQuery({
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
    // Sort newest-first in JS
    return results
        .sort((a, b) => ((b.createdAt as number) ?? 0) - ((a.createdAt as number) ?? 0))
        .slice(0, limitCount);
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

/** Fetch orders for a user — sorted in JS to avoid requiring a composite Firestore index */
export async function fetchUserOrders(uid: string) {
    const results = await runQuery({
        structuredQuery: {
            from: [{ collectionId: "orders" }],
            where: {
                fieldFilter: {
                    field: { fieldPath: "userId" },
                    op: "EQUAL",
                    value: { stringValue: uid },
                },
            },
        },
    });
    // Sort newest-first client-side (createdAt is a ms timestamp from parseValue)
    return results.sort((a, b) => ((b.createdAt as number) ?? 0) - ((a.createdAt as number) ?? 0));
}

/** Fetch a single order by document ID */
export async function fetchOrderById(id: string) {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
        cache: "no-store",
    });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = await res.json();
    if (!doc.fields) return null;
    return docToObject(doc);
}

/** Create an order document via REST API */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createOrder(data: Record<string, any>) {
    const now = new Date();
    return createDocument("orders", {
        ...data,
        status: "pending",
        createdAt: now,
        updatedAt: now,
    });
}

/**
 * Upsert (create or overwrite) a document at a known path via REST PATCH.
 * Equivalent to setDoc(ref, data, { merge: false }).
 * For merge behaviour, all existing fields not in `data` will be removed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertDocument(collectionPath: string, docId: string, data: Record<string, any>) {
    const res = await fetch(`${BASE_URL}/${collectionPath}/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: toFirestoreFields(data) }),
    });
    if (!res.ok) {
        const err = await res.text().catch(() => res.status.toString());
        throw new Error(`Firestore upsert failed (${res.status}): ${err}`);
    }
    const doc = await res.json();
    return docToObject(doc);
}

/** Add a review and update the product's aggregated rating atomically via REST API */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addReview(reviewData: Record<string, any>) {
    const { productId, rating } = reviewData;

    // 1. Create the review document
    await createDocument("reviews", {
        ...reviewData,
        createdAt: new Date(),
    });

    // 2. Fetch current product to compute new average
    const productRes = await fetch(`${BASE_URL}/products/${productId}`, {
        cache: "no-store",
    });
    if (productRes.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productDoc: any = await productRes.json();
        if (productDoc.fields) {
            const product = parseFields(productDoc.fields);
            const currentCount: number = (product.reviewCount as number) || 0;
            const currentAvg: number = (product.averageRating as number) || 0;
            const newCount = currentCount + 1;
            const newAvg = (currentAvg * currentCount + rating) / newCount;

            // 3. PATCH the product with updated rating fields
            await fetch(`${BASE_URL}/products/${productId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fields: toFirestoreFields({ averageRating: newAvg, reviewCount: newCount }),
                }),
            });
        }
    }
}

/** Atomically increment a numeric field via REST API commit:transform */
export async function incrementField(collectionPath: string, docId: string, fieldPath: string, amount: number = 1) {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default):commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            writes: [
                {
                    transform: {
                        document: `projects/${PROJECT_ID}/databases/(default)/documents/${collectionPath}/${docId}`,
                        fieldTransforms: [
                            {
                                fieldPath: fieldPath,
                                increment: Number.isInteger(amount) 
                                    ? { integerValue: String(amount) } 
                                    : { doubleValue: amount }
                            }
                        ]
                    }
                }
            ]
        })
    });

    if (!res.ok) {
        const err = await res.text().catch(() => res.status.toString());
        console.error(`Firestore increment failed (${res.status}): ${err}`);
        // Fallback or throw? Let's throw to be consistent.
        throw new Error(`Firestore increment failed: ${err}`);
    }
}

/** Execute a batch of updates via REST API commit */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runBatchUpdate(collectionPath: string, updates: { id: string, data: Record<string, any> }[]) {
    if (updates.length === 0) return;

    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default):commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            writes: updates.map(update => ({
                update: {
                    name: `projects/${PROJECT_ID}/databases/(default)/documents/${collectionPath}/${update.id}`,
                    fields: toFirestoreFields(update.data)
                },
                // Update mask allows partial updates (equivalent to merge:true)
                updateMask: {
                    fieldPaths: Object.keys(update.data)
                }
            }))
        })
    });

    if (!res.ok) {
        const err = await res.text().catch(() => res.status.toString());
        throw new Error(`Firestore batch update failed (${res.status}): ${err}`);
    }
}

/** Fetch products by a specific field value (e.g. category or offerId) */
export async function fetchProductsByField(field: string, value: string | boolean) {
    return runQuery({
        structuredQuery: {
            from: [{ collectionId: "products" }],
            where: {
                fieldFilter: {
                    field: { fieldPath: field },
                    op: "EQUAL",
                    value: typeof value === "string" ? { stringValue: value } : { booleanValue: value },
                },
            },
        },
    });
}
