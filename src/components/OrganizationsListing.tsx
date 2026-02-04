import { h } from 'preact';
import DataListing, { type ColumnConfig } from './DataListing';

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

const columns: ColumnConfig[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type', hideOnMobile: true },
  { key: 'relationship', label: 'Relationship', hideOnTablet: true },
  { key: 'established', label: 'Established', showInTable: false },
  { key: 'location', label: 'Location', showInTable: false },
];

export default function OrganizationsListing({ organizations }: OrganizationsListingProps) {
  return (
    <DataListing
      data={organizations}
      columns={columns}
      searchPlaceholder="Search organizations by name, type, relationship, location, or ID..."
      emptyMessage="No organizations found matching your search."
      detailEmptyMessage="Select an organization to view details"
      detailPath="/organizations"
      detailButtonLabel="View Profile"
    />
  );
}

