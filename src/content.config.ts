import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const employees = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/employees' }),
  schema: z.object({
    name: z.string(),
    position: z.string(),
    department: z.string(),
    employeeId: z.string(),
    clearanceLevel: z.string(),
  }),
});

const anomalies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/anomalies' }),
  schema: z.object({
    anomalyId: z.string(),
    title: z.string(),
    classification: z.string(),
    status: z.string(),
    discoveryDate: z.string(),
    location: z.string(),
  }),
});

const organizations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/organizations' }),
  schema: z.object({
    orgId: z.string(),
    name: z.string(),
    type: z.string(),
    relationship: z.string(),
    established: z.string(),
    location: z.string(),
  }),
});

export const collections = {
  employees,
  anomalies,
  organizations,
};
