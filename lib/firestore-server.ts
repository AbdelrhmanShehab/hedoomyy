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
