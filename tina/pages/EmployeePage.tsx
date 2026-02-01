import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { EmployeeQuery, EmployeeQueryVariables } from '../__generated__/types';
import Table from '../components/Table';

type Props = {
  variables: EmployeeQueryVariables;
  data: EmployeeQuery;
  query: string;
};

export default function EmployeePage(props: Props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const employee = data.employee;

  return (
    <>
      <h2 data-tina-field={tinaField(employee, 'name')}>{employee.name}</h2>

      <Table>
        <tbody>
          <tr>
            <td><strong>Employee ID:</strong></td>
            <td data-tina-field={tinaField(employee, 'employeeId')}>{employee.employeeId}</td>
          </tr>
          <tr>
            <td><strong>Position:</strong></td>
            <td data-tina-field={tinaField(employee, 'position')}>{employee.position}</td>
          </tr>
          <tr>
            <td><strong>Department:</strong></td>
            <td data-tina-field={tinaField(employee, 'department')}>{employee.department}</td>
          </tr>
          <tr>
            <td><strong>Clearance Level:</strong></td>
            <td data-tina-field={tinaField(employee, 'clearanceLevel')}>{employee.clearanceLevel}</td>
          </tr>
        </tbody>
      </Table>

      <hr className="mt-1" />

      <div className="field-border mt-2">
        <article data-tina-field={tinaField(employee, 'body')}>
          <TinaMarkdown content={employee.body} />
        </article>
      </div>
    </>
  );
}
