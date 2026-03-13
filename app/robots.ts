import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/product/", "/about", "/policy"],
        disallow: [
          "/admin/",
          "/checkout/",
          "/account/",
          "/favorites/",
          "/confirmation/",
          "/api/",
        ],
      },
    ],
    sitemap: "https://hedoomyy.com/sitemap.xml",
    host: "https://hedoomyy.com",
  };
}
