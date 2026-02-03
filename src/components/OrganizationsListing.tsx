import { h } from 'preact';
import DataListing, { type ColumnConfig, type DetailField } from './DataListing';

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
];

const detailFields: DetailField[] = [
  { key: 'id', label: 'Organization ID:' },
  { key: 'type', label: 'Type:' },
  { key: 'relationship', label: 'Relationship:' },
  { key: 'established', label: 'Established:' },
  { key: 'location', label: 'Location:' },
];

export default function OrganizationsListing({ organizations }: OrganizationsListingProps) {
  return (
    <DataListing
      data={organizations}
      columns={columns}
      detailFields={detailFields}
      searchPlaceholder="Search organizations by name, type, relationship, location, or ID..."
      emptyMessage="No organizations found matching your search."
      detailEmptyMessage="Select an organization to view details"
      detailPath="/organizations"
      detailButtonLabel="View Profile"
    />
  );
}

