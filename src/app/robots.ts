import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/vi", "/en"],
      disallow: [
        "/auth/",
        "/app/",
        "/conversations/",
        "/groups/",
        "/profile/",
        "/vi/auth/",
        "/vi/app/",
        "/vi/conversations/",
        "/vi/groups/",
        "/vi/profile/",
        "/en/auth/",
        "/en/app/",
        "/en/conversations/",
        "/en/groups/",
        "/en/profile/",
      ],
    },
    sitemap: "https://conyva.app/sitemap.xml",
    host: "https://conyva.app",
  };
}
