import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import { mapContentTypes } from './content-types';

export const collections = mapContentTypes(type => defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: `./src/content/${type.slug}` }),
  schema: z.object({
    id: z.string().regex(new RegExp(`^(?:${type.idPattern.source})$`)),
    name: z.string().min(1),
    metadata: z.record(z.string().refine(key => key.trim().length > 0, 'Metadata keys must not be blank.'), z.string()).default({}),
  }).strict(),
}));
