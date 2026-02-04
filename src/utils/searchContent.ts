import { getCollection } from 'astro:content';
import Fuse from 'fuse.js';

export interface SearchResult {
  title: string;
  description: string;
  url: string;
  type: 'employee' | 'anomaly' | 'organization';
}

export async function getAllSearchableContent(): Promise<SearchResult[]> {
  const [employees, anomalies, organizations] = await Promise.all([
    getCollection('employees'),
    getCollection('anomalies'),
    getCollection('organizations'),
  ]);

  const results: SearchResult[] = [];

  // Add employees
  for (const employee of employees) {
    results.push({
      title: employee.data.name,
      description: `${employee.data.position} - ${employee.data.department}`,
      url: `/employees/${employee.slug}`,
      type: 'employee',
    });
  }

  // Add anomalies
  for (const anomaly of anomalies) {
    results.push({
      title: anomaly.data.name,
      description: `${anomaly.data.classification} - ${anomaly.data.status}`,
      url: `/anomalies/${anomaly.slug}`,
      type: 'anomaly',
    });
  }

  // Add organizations
  for (const organization of organizations) {
    results.push({
      title: organization.data.name,
      description: `${organization.data.type} - ${organization.data.relationship}`,
      url: `/organizations/${organization.slug}`,
      type: 'organization',
    });
  }

  return results;
}

export function createSearchIndex(content: SearchResult[]) {
  return new Fuse(content, {
    keys: ['title', 'description'],
    threshold: 0.3,
    includeScore: true,
  });
}

export function searchContent(query: string, searchIndex: Fuse<SearchResult>): SearchResult[] {
  const results = searchIndex.search(query);
  return results.slice(0, 5).map(result => result.item);
}
