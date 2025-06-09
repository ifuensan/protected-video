import { defineCollection, z } from "astro:content";

const clases = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.string(),
    duration: z.string(),
    description: z.string(),
    image: z.string(),
    file: z.string(),
    hotmartUrl: z.string().url(),
  }),
});

export const collections = {
  clases,
};
