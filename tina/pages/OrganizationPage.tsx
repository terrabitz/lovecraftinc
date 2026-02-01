import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { OrganizationQuery, OrganizationQueryVariables } from '../__generated__/types';
import Table from '../components/Table';

type Props = {
  variables: OrganizationQueryVariables;
  data: OrganizationQuery;
  query: string;
};

export default function OrganizationPage(props: Props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const organization = data.organization;

  return (
    <>
      <h2 data-tina-field={tinaField(organization, 'name')}>{organization.name}</h2>

      <Table>
        <tbody>
          <tr>
            <td><strong>Organization ID:</strong></td>
            <td data-tina-field={tinaField(organization, 'orgId')}>{organization.orgId}</td>
          </tr>
          <tr>
            <td><strong>Type:</strong></td>
            <td data-tina-field={tinaField(organization, 'type')}>{organization.type}</td>
          </tr>
          <tr>
            <td><strong>Relationship:</strong></td>
            <td data-tina-field={tinaField(organization, 'relationship')}>{organization.relationship}</td>
          </tr>
          <tr>
            <td><strong>Established:</strong></td>
            <td data-tina-field={tinaField(organization, 'established')}>{organization.established}</td>
          </tr>
          <tr>
            <td><strong>Location:</strong></td>
            <td data-tina-field={tinaField(organization, 'location')}>{organization.location}</td>
          </tr>
        </tbody>
      </Table>

      <hr className="mt-1" />

      <div className="field-border mt-2">
        <article data-tina-field={tinaField(organization, 'body')}>
          <TinaMarkdown content={organization.body} />
        </article>
      </div>
    </>
  );
}
