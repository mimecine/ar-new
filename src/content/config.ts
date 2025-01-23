import { date } from "astro/zod";
import { defineCollection, reference, z } from "astro:content";

const artists = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      url: z.string().optional(),
      featuredImage: image().optional(),
      resources: z.array(z.string()).optional(),
      hidden: z.boolean().optional(),
      works: z
        .array(
          z.object({
            title: z.string().optional(),
            inventorynumber: z.string().optional(),
            info: z.string().optional(),
            credit: z.string().optional(),
            category: z.string().optional(),
            year: z.coerce.number().optional(),
            src: image(),
          })
        )
        .optional(),
    }),
});

const rooms = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      url: z.string().optional(),
      venue: z.string().optional(),
      artists: z.array(z.string()).optional(),
      priority: z.number().optional(),
      hidden: z.boolean().optional(),
      images: z.array(image()).optional(),
      startdate: z.coerce.date().optional(),
      enddate: z.coerce.date().optional(),
      ongoing: z.boolean().optional(),
    }),
});

const venues = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      town: z.string().optional(),
      address: z.string().optional(),
      map: z.string().optional(),
      url: z.string().optional(),
      about: z.string().optional(),
      lat: z.number().optional(),
      lon: z.number().optional(),
      geo: z.string().optional(),
    //   geo: z
    //     .object({
    //       type: z.string().optional(),
    //       coordinates: z.array(z.number()).optional(),
    //     })
    //     .optional(),
      hidden: z.boolean().optional(),
    }),
});
const films = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      url: z.string().optional(),
      artists: z.array(z.string()).optional(),
      hidden: z.boolean().optional(),
    }),
});

const pages = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      hidden: z.boolean().optional(),
      artists: z.array(z.string()).optional(),
      rooms: z.array(z.string()).optional(),
    }),
});

const news = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      hidden: z.boolean().optional(),
      date: z.coerce.date(),
    }),
});

export const collections = { artists, rooms, venues, films, pages, news };
