import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
    host: true, // Listen on all network interfaces
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
  schema: {
    collections: [
      {
        name: "employee",
        label: "Employees",
        path: "src/content/employees",
        ui: {
          router({ document }) {
            return `/employees/${(document as any).employeeId}`;
          },
        },
        fields: [
          {
            type: "string",
            name: "name",
            label: "Name",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "position",
            label: "Position",
            required: true,
          },
          {
            type: "string",
            name: "department",
            label: "Department",
            required: true,
          },
          {
            type: "string",
            name: "employeeId",
            label: "Employee ID",
            required: true,
          },
          {
            type: "string",
            name: "clearanceLevel",
            label: "Clearance Level",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "anomaly",
        label: "Anomalies",
        path: "src/content/anomalies",
        ui: {
          router({ document }) {
            return `/anomalies/${(document as any).anomalyId}`;
          },
        },
        fields: [
          {
            type: "string",
            name: "anomalyId",
            label: "Anomaly ID",
            required: true,
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "classification",
            label: "Classification",
            required: true,
          },
          {
            type: "string",
            name: "status",
            label: "Status",
            required: true,
          },
          {
            type: "string",
            name: "discoveryDate",
            label: "Discovery Date",
            required: true,
          },
          {
            type: "string",
            name: "location",
            label: "Location",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "organization",
        label: "Organizations",
        path: "src/content/organizations",
        ui: {
          router({ document }) {
            return `/organizations/${(document as any).orgId}`;
          },
        },
        fields: [
          {
            type: "string",
            name: "orgId",
            label: "Organization ID",
            required: true,
          },
          {
            type: "string",
            name: "name",
            label: "Name",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "type",
            label: "Type",
            required: true,
          },
          {
            type: "string",
            name: "relationship",
            label: "Relationship",
            required: true,
          },
          {
            type: "string",
            name: "established",
            label: "Established",
            required: true,
          },
          {
            type: "string",
            name: "location",
            label: "Location",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
