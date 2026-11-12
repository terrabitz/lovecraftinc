export interface MetadataColumn {
  key: string;
  label: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

export interface ContentTypeDefinition {
  slug: string;
  label: string;
  singular: string;
  heading: string;
  description: string;
  idPattern: RegExp;
  idHint: string;
  icon?: string;
  columns?: readonly MetadataColumn[];
}

const definitions = [
  {
    slug: 'employees',
    label: 'Employees',
    singular: 'Employee',
    heading: 'Employee Directory',
    description: 'Access employee profiles, contact information, and organizational assignments.',
    idPattern: /EID-EMP-\d+/,
    idHint: 'ID must start with "EID-EMP-" followed by numbers',
    icon: 'Employee',
    columns: [
      { key: 'position', label: 'Position', hideOnMobile: true },
      { key: 'department', label: 'Department', hideOnTablet: true },
    ],
  },
  {
    slug: 'anomalies',
    label: 'Anomalies',
    singular: 'Anomaly',
    heading: 'Anomaly Reports',
    description: 'Review documented anomalous events and phenomena requiring investigation.',
    idPattern: /EID-\d+/,
    idHint: 'ID must start with "EID-" followed by numbers (e.g. EID-123)',
    icon: 'Anomaly',
    columns: [
      { key: 'classification', label: 'Classification', hideOnMobile: true },
      { key: 'status', label: 'Status', hideOnTablet: true },
    ],
  },
  {
    slug: 'organizations',
    label: 'Organizations',
    singular: 'Organization',
    heading: 'Partner Organizations',
    description: 'Access profiles of partner organizations and affiliated entities.',
    idPattern: /EID-ORG-\d+/,
    idHint: 'ID must start with "EID-ORG-" followed by numbers',
    icon: 'Organization',
    columns: [
      { key: 'type', label: 'Type', hideOnMobile: true },
      { key: 'relationship', label: 'Relationship', hideOnTablet: true },
    ],
  },
] as const satisfies readonly ContentTypeDefinition[];

export type ContentType = (typeof definitions)[number]['slug'];
export const contentTypes: readonly (ContentTypeDefinition & { slug: ContentType })[] = definitions;

export function mapContentTypes<T>(
  create: (type: ContentTypeDefinition) => T,
): Record<ContentType, T> {
  return Object.fromEntries(contentTypes.map(type => [type.slug, create(type)])) as Record<ContentType, T>;
}

export function getArticleTypes() {
  return contentTypes.map(type => ({
    pattern: type.idPattern,
    urlPrefix: `/${type.slug}`,
    contentPath: type.slug,
  }));
}
