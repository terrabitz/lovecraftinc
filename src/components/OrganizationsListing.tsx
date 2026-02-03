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
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

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
      const aValue = String(a[sortField]).toLowerCase();
      const bValue = String(b[sortField]).toLowerCase();
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [organizations, searchQuery, sortField, sortDirection]);

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const handleKeyDown = (e: KeyboardEvent, field: SortField) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(field);
    }
  };

  return (
    <div style="width: 100%;">
      <SearchBox 
        onSearch={setSearchQuery} 
        placeholder="Search organizations by name, type, relationship, location, or ID..."
      />
      
      <div class="listing-container">
        <div class="table-wrapper">
          <table class="listing-table">
            <thead>
              <tr>
                <th 
                  style="cursor: pointer;" 
                  onClick={() => handleSort('id')}
                  onKeyDown={(e) => handleKeyDown(e, 'id')}
                  role="button"
                  tabIndex={0}
                >
                  ID{getSortIndicator('id')}
                </th>
                <th 
                  style="cursor: pointer;" 
                  onClick={() => handleSort('name')}
                  onKeyDown={(e) => handleKeyDown(e, 'name')}
                  role="button"
                  tabIndex={0}
                >
                  Name{getSortIndicator('name')}
                </th>
                <th 
                  class="hide-mobile"
                  style="cursor: pointer;" 
                  onClick={() => handleSort('type')}
                  onKeyDown={(e) => handleKeyDown(e, 'type')}
                  role="button"
                  tabIndex={0}
                >
                  Type{getSortIndicator('type')}
                </th>
                <th 
                  class="hide-tablet"
                  style="cursor: pointer;" 
                  onClick={() => handleSort('relationship')}
                  onKeyDown={(e) => handleKeyDown(e, 'relationship')}
                  role="button"
                  tabIndex={0}
                >
                  Relationship{getSortIndicator('relationship')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrganizations.length === 0 ? (
                <tr>
                  <td colSpan={4} style="text-align: center; padding: 20px;">
                    No organizations found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAndSortedOrganizations.map(org => (
                  <tr 
                    key={org.id}
                    class={selectedOrganization?.id === org.id ? 'selected' : ''}
                    onClick={() => setSelectedOrganization(org)}
                    style="cursor: pointer;"
                  >
                    <td>{org.id}</td>
                    <td>{org.name}</td>
                    <td class="hide-mobile">{org.type}</td>
                    <td class="hide-tablet">{org.relationship}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div class="detail-panel">
          {selectedOrganization ? (
            <>
              <h3>{selectedOrganization.name}</h3>
              <div class="sunken-panel">
                <table>
                  <tbody>
                    <tr>
                      <td><strong>Organization ID:</strong></td>
                      <td>{selectedOrganization.id}</td>
                    </tr>
                    <tr>
                      <td><strong>Type:</strong></td>
                      <td>{selectedOrganization.type}</td>
                    </tr>
                    <tr>
                      <td><strong>Relationship:</strong></td>
                      <td>{selectedOrganization.relationship}</td>
                    </tr>
                    <tr>
                      <td><strong>Established:</strong></td>
                      <td>{selectedOrganization.established}</td>
                    </tr>
                    <tr>
                      <td><strong>Location:</strong></td>
                      <td>{selectedOrganization.location}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="detail-actions">
                <a href={`/organizations/${selectedOrganization.id.toUpperCase()}`}>
                  <button>View Profile</button>
                </a>
              </div>
            </>
          ) : (
            <div class="detail-empty">
              <p>Select an organization to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
