import { h } from 'preact';
import DataListing, { type ColumnConfig } from './DataListing';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
}

interface EmployeesListingProps {
  employees: Employee[];
}

const columns: ColumnConfig[] = [
  { key: 'id', label: 'ID', detailLabel: 'ID:', showInDetail: true },
  { key: 'name', label: 'Name', detailLabel: 'Name:', showInDetail: true },
  { key: 'position', label: 'Position', detailLabel: 'Position:', hideOnMobile: true, showInDetail: true },
  { key: 'department', label: 'Department', detailLabel: 'Department:', hideOnTablet: true, showInDetail: true },
];

export default function EmployeesListing({ employees }: EmployeesListingProps) {
  return (
    <DataListing
      data={employees}
      columns={columns}
      searchPlaceholder="Search employees by name, position, department, or ID..."
      emptyMessage="No employees found matching your search."
      detailEmptyMessage="Select an employee to view details"
      detailPath="/employees"
      detailButtonLabel="View Profile"
    />
  );
}

