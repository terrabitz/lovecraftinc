import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import SearchBox from './SearchBox';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
}

interface EmployeesListingProps {
  employees: Employee[];
}

type SortField = 'name' | 'position' | 'department' | 'id';
type SortDirection = 'asc' | 'desc';

export default function EmployeesListing({ employees }: EmployeesListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let result = employees;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(emp => 
        emp.name.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query) ||
        emp.id.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [employees, searchQuery, sortField, sortDirection]);

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div style="width: 100%;">
      <SearchBox 
        onSearch={setSearchQuery} 
        placeholder="Search employees by name, position, department, or ID..."
      />
      
      <table style="width: 100%;">
        <thead>
          <tr>
            <th style="cursor: pointer;" onClick={() => handleSort('name')}>
              Name{getSortIndicator('name')}
            </th>
            <th style="cursor: pointer;" onClick={() => handleSort('position')}>
              Position{getSortIndicator('position')}
            </th>
            <th style="cursor: pointer;" onClick={() => handleSort('department')}>
              Department{getSortIndicator('department')}
            </th>
            <th style="cursor: pointer;" onClick={() => handleSort('id')}>
              ID{getSortIndicator('id')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedEmployees.length === 0 ? (
            <tr>
              <td colSpan={5} style="text-align: center; padding: 20px;">
                No employees found matching your search.
              </td>
            </tr>
          ) : (
            filteredAndSortedEmployees.map(employee => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.position}</td>
                <td>{employee.department}</td>
                <td>{employee.id}</td>
                <td>
                  <a href={`/employees/${employee.id.toUpperCase()}`}>
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
