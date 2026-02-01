import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { AnomalyQuery, AnomalyQueryVariables } from '../__generated__/types';
import Table from '../components/Table';

type Props = {
  variables: AnomalyQueryVariables;
  data: AnomalyQuery;
  query: string;
};

export default function AnomalyPage(props: Props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const anomaly = data.anomaly;

  return (
    <>
      <h2 data-tina-field={tinaField(anomaly, 'title')}>{anomaly.title}</h2>

      <Table>
        <tbody>
          <tr>
            <td><strong>Anomaly ID:</strong></td>
            <td data-tina-field={tinaField(anomaly, 'anomalyId')}>{anomaly.anomalyId}</td>
          </tr>
          <tr>
            <td><strong>Classification:</strong></td>
            <td data-tina-field={tinaField(anomaly, 'classification')}>{anomaly.classification}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td data-tina-field={tinaField(anomaly, 'status')}>{anomaly.status}</td>
          </tr>
          <tr>
            <td><strong>Discovery Date:</strong></td>
            <td data-tina-field={tinaField(anomaly, 'discoveryDate')}>{anomaly.discoveryDate}</td>
          </tr>
          <tr>
            <td><strong>Location:</strong></td>
            <td data-tina-field={tinaField(anomaly, 'location')}>{anomaly.location}</td>
          </tr>
        </tbody>
      </Table>

      <hr className="mt-1" />

      <div className="field-border mt-2">
        <article data-tina-field={tinaField(anomaly, 'body')}>
          <TinaMarkdown content={anomaly.body} />
        </article>
      </div>
    </>
  );
}
