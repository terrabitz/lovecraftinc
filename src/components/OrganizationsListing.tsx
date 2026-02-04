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
  { key: 'id', label: 'ID', detailLabel: 'ID:', showInDetail: true },
  { key: 'name', label: 'Name', detailLabel: 'Name:', showInDetail: true },
  { key: 'type', label: 'Type', detailLabel: 'Type:', hideOnMobile: true, showInDetail: true },
  { key: 'relationship', label: 'Relationship', detailLabel: 'Relationship:', hideOnTablet: true, showInDetail: true },
  { key: 'established', label: 'Established', detailLabel: 'Established:', showInTable: false, showInDetail: true },
  { key: 'location', label: 'Location', detailLabel: 'Location:', showInTable: false, showInDetail: true },
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

