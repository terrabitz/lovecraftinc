import { defineCollection, z } from 'astro:content';

const employees = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    position: z.string(),
    department: z.string(),
    employeeId: z.string(),
    clearanceLevel: z.string(),
  }),
});

const anomalies = defineCollection({
  type: 'content',
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
  type: 'content',
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
