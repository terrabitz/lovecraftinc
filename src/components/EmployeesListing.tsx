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
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'position', label: 'Position', hideOnMobile: true },
  { key: 'department', label: 'Department', hideOnTablet: true },
];

export default function EmployeesListing({ employees }: EmployeesListingProps) {
  return (
    <DataListing
      data={employees}
      columns={columns}
      emptyMessage="No employees found matching your search."
      detailEmptyMessage="Select an employee to view details"
      detailPath="/employees"
      detailButtonLabel="View Profile"
    />
  );
}

