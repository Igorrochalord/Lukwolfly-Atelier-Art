import type { MetadataRoute } from "next";

import { nav, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", ...nav.map((n) => n.href), "/orcamento"].map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" }));
}
