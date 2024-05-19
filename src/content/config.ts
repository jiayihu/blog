import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      cover: image()
        .refine((img) => img.width >= 1200, {
          message: "Cover image must be at least 1200 pixels wide",
        })
        .refine((img) => img.height >= 630, {
          message: "Cover image must be at least 630 pixels tall",
        })
        .optional(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
    }),
});

export const collections = { blog };
