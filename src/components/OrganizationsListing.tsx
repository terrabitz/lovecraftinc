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

export default function OrganizationsListing({ organizations }: OrganizationsListingProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) {
      return organizations;
    }

    const query = searchQuery.toLowerCase();
    return organizations.filter(org => 
      org.name.toLowerCase().includes(query) ||
      org.type.toLowerCase().includes(query) ||
      org.relationship.toLowerCase().includes(query) ||
      org.location.toLowerCase().includes(query) ||
      org.id.toLowerCase().includes(query)
    );
  }, [organizations, searchQuery]);

  return (
    <div>
      <SearchBox 
        onSearch={setSearchQuery} 
        placeholder="Search organizations by name, type, relationship, location, or ID..."
      />
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Organization ID</th>
            <th>Type</th>
            <th>Relationship</th>
            <th>Established</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrganizations.length === 0 ? (
            <tr>
              <td colSpan={7} style="text-align: center; padding: 20px;">
                No organizations found matching your search.
              </td>
            </tr>
          ) : (
            filteredOrganizations.map(org => (
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
