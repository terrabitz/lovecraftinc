import { h } from 'preact';
import DataListing, { type ColumnConfig } from './DataListing';

interface Anomaly {
  id: string;
  name: string;
  classification: string;
  status: string;
  discoveryDate: string;
  location: string;
}

interface AnomaliesListingProps {
  anomalies: Anomaly[];
}

const columns: ColumnConfig[] = [
  { key: 'id', label: 'ID', showInDetail: true },
  { key: 'name', label: 'Name', showInDetail: true },
  { key: 'classification', label: 'Classification', hideOnMobile: true, showInDetail: true },
  { key: 'status', label: 'Status', hideOnTablet: true, showInDetail: true },
  { key: 'discoveryDate', label: 'Discovery Date', showInTable: false, showInDetail: true },
  { key: 'location', label: 'Location', showInTable: false, showInDetail: true },
];

export default function AnomaliesListing({ anomalies }: AnomaliesListingProps) {
  return (
    <DataListing
      data={anomalies}
      columns={columns}
      searchPlaceholder="Search anomalies by name, classification, status, location, or ID..."
      emptyMessage="No anomalies found matching your search."
      detailEmptyMessage="Select an anomaly to view details"
      detailPath="/anomalies"
      detailButtonLabel="View Full Report"
    />
  );
}

