import { h } from 'preact';
import DataListing, { type ColumnConfig, type DetailField } from './DataListing';

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
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'classification', label: 'Classification', hideOnMobile: true },
  { key: 'status', label: 'Status', hideOnTablet: true },
];

const detailFields: DetailField[] = [
  { key: 'id', label: 'Anomaly ID:' },
  { key: 'classification', label: 'Classification:' },
  { key: 'status', label: 'Status:' },
  { key: 'discoveryDate', label: 'Discovery Date:' },
  { key: 'location', label: 'Location:' },
];

export default function AnomaliesListing({ anomalies }: AnomaliesListingProps) {
  return (
    <DataListing
      data={anomalies}
      columns={columns}
      detailFields={detailFields}
      searchPlaceholder="Search anomalies by name, classification, status, location, or ID..."
      emptyMessage="No anomalies found matching your search."
      detailEmptyMessage="Select an anomaly to view details"
      detailPath="/anomalies"
      detailButtonLabel="View Full Report"
    />
  );
}

