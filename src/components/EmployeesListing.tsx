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

export default function EmployeesListing({ employees }: EmployeesListingProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }

    const query = searchQuery.toLowerCase();
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.id.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  return (
    <div>
      <SearchBox 
        onSearch={setSearchQuery} 
        placeholder="Search employees by name, position, department, or ID..."
      />
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Department</th>
            <th>ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length === 0 ? (
            <tr>
              <td colSpan={5} style="text-align: center; padding: 20px;">
                No employees found matching your search.
              </td>
            </tr>
          ) : (
            filteredEmployees.map(employee => (
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
