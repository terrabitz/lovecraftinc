import { defineCollection, z } from 'astro:content';
import client from '../tina/__generated__/client';

const employees = defineCollection({
  loader: async () => {
    const response = await client.queries.employeeConnection();

    return response.data.employeeConnection.edges
      ?.filter((employee) => !!employee)
      .map((employee) => {
        const node = employee?.node;

        return {
          ...node,
          id: node?._sys.relativePath.replace(/\.md$/, '') || '',
          tinaInfo: node?._sys,
        };
      }) || [];
  },
  schema: z.object({
    tinaInfo: z.object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    }),
    name: z.string(),
    position: z.string(),
    department: z.string(),
    employeeId: z.string(),
    clearanceLevel: z.string(),
    body: z.any(),
  }),
});

const anomalies = defineCollection({
  loader: async () => {
    const response = await client.queries.anomalyConnection();

    return response.data.anomalyConnection.edges
      ?.filter((anomaly) => !!anomaly)
      .map((anomaly) => {
        const node = anomaly?.node;

        return {
          ...node,
          id: node?._sys.relativePath.replace(/\.md$/, '') || '',
          tinaInfo: node?._sys,
        };
      }) || [];
  },
  schema: z.object({
    tinaInfo: z.object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    }),
    anomalyId: z.string(),
    title: z.string(),
    classification: z.string(),
    status: z.string(),
    discoveryDate: z.string(),
    location: z.string(),
    body: z.any(),
  }),
});

const organizations = defineCollection({
  loader: async () => {
    const response = await client.queries.organizationConnection();

    return response.data.organizationConnection.edges
      ?.filter((org) => !!org)
      .map((org) => {
        const node = org?.node;

        return {
          ...node,
          id: node?._sys.relativePath.replace(/\.md$/, '') || '',
          tinaInfo: node?._sys,
        };
      }) || [];
  },
  schema: z.object({
    tinaInfo: z.object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    }),
    orgId: z.string(),
    name: z.string(),
    type: z.string(),
    relationship: z.string(),
    established: z.string(),
    location: z.string(),
    body: z.any(),
  }),
});

export const collections = {
  employees,
  anomalies,
  organizations,
};
