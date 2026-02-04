import { getCollection } from 'astro:content';
import type { SearchResult } from '../types/search';

export type { SearchResult };

export async function getAllSearchableContent(): Promise<SearchResult[]> {
  const [employees, anomalies, organizations] = await Promise.all([
    getCollection('employees'),
    getCollection('anomalies'),
    getCollection('organizations'),
  ]);

  const results: SearchResult[] = [];

  // Add employees
  for (const employee of employees) {
    const content = employee.body || '';
    
    results.push({
      id: employee.data.id,
      title: employee.data.name,
      url: `/employees/${employee.data.id.toUpperCase()}`,
      type: 'employee',
      content,
    });
  }

  // Add anomalies
  for (const anomaly of anomalies) {
    const content = anomaly.body || '';
    
    results.push({
      id: anomaly.data.id,
      title: anomaly.data.name,
      url: `/anomalies/${anomaly.data.id.toUpperCase()}`,
      type: 'anomaly',
      content,
    });
  }

  // Add organizations
  for (const organization of organizations) {
    const content = organization.body || '';
    
    results.push({
      id: organization.data.id,
      title: organization.data.name,
      url: `/organizations/${organization.data.id.toUpperCase()}`,
      type: 'organization',
      content,
    });
  }

  return results;
}
