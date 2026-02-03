import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import SearchBox from './SearchBox';

interface Organization {
  id: string;
  name: string;
  type: string;
  relationship: string;
  established: string;
  location: string;
}

interface OrganizationsListingProps {
  organizations: Organization[];
}

type SortField = 'name' | 'id' | 'type' | 'relationship' | 'established' | 'location';
type SortDirection = 'asc' | 'desc';

export default function OrganizationsListing({ organizations }: OrganizationsListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedOrganizations = useMemo(() => {
    let result = organizations;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(org => 
        org.name.toLowerCase().includes(query) ||
        org.type.toLowerCase().includes(query) ||
        org.relationship.toLowerCase().includes(query) ||
        org.location.toLowerCase().includes(query) ||
        org.id.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [organizations, searchQuery, sortField, sortDirection]);

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div style="width: 100%;">
      <SearchBox 
        onSearch={setSearchQuery} 
        placeholder="Search organizations by name, type, relationship, location, or ID..."
      />
      
      <table style="width: 100%;">
        <thead>
          <tr>
            <th style="cursor: pointer;" onClick={() => handleSort('name')}>
              Name{getSortIndicator('name')}
            </th>
            <th style="cursor: pointer;" onClick={() => handleSort('id')}>
              Organization ID{getSortIndicator('id')}
            </th>
            <th style="cursor: pointer;" onClick={() => handleSort('type')}>
              Type{getSortIndicator('type')}
            </th>
            <th style="cursor: pointer;" onClick={() => handleSort('relationship')}>
              Relationship{getSortIndicator('relationship')}
            </th>
            <th style="cursor: pointer;" onClick={() => handleSort('established')}>
              Established{getSortIndicator('established')}
            </th>
            <th style="cursor: pointer;" onClick={() => handleSort('location')}>
              Location{getSortIndicator('location')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedOrganizations.length === 0 ? (
            <tr>
              <td colSpan={7} style="text-align: center; padding: 20px;">
                No organizations found matching your search.
              </td>
            </tr>
          ) : (
            filteredAndSortedOrganizations.map(org => (
              <tr key={org.id}>
                <td>{org.name}</td>
                <td>{org.id}</td>
                <td>{org.type}</td>
                <td>{org.relationship}</td>
                <td>{org.established}</td>
                <td>{org.location}</td>
                <td>
                  <a href={`/organizations/${org.id.toUpperCase()}`}>
                    <button>View Profile</button>
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
