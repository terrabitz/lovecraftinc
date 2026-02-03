import { h } from 'preact';
import DataListing, { type ColumnConfig, type DetailField } from './DataListing';

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

const detailFields: DetailField[] = [
  { key: 'id', label: 'Employee ID:' },
  { key: 'position', label: 'Position:' },
  { key: 'department', label: 'Department:' },
];

export default function EmployeesListing({ employees }: EmployeesListingProps) {
  return (
    <DataListing
      data={employees}
      columns={columns}
      detailFields={detailFields}
      searchPlaceholder="Search employees by name, position, department, or ID..."
      emptyMessage="No employees found matching your search."
      detailEmptyMessage="Select an employee to view details"
      detailPath="/employees"
      detailButtonLabel="View Profile"
    />
  );
}

