import type { MetadataRoute } from "next"

const root = "https://f.c30.life"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    {
      url: root,
      lastModified: new Date(),
    },
    {
      url: `${root}/pages/*`,
      lastModified: new Date(),
    },
    {
      url: `${root}/info`,
      lastModified: new Date(),
    },
    {
      url: `${root}/api-doc`,
      lastModified: new Date(),
    },
  ]

  return pages
}
