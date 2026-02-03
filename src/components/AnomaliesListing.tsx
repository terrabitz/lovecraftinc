import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import SearchBox from './SearchBox';

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

export default function AnomaliesListing({ anomalies }: AnomaliesListingProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnomalies = useMemo(() => {
    if (!searchQuery.trim()) {
      return anomalies;
    }

    const query = searchQuery.toLowerCase();
    return anomalies.filter(anomaly => 
      anomaly.name.toLowerCase().includes(query) ||
      anomaly.classification.toLowerCase().includes(query) ||
      anomaly.status.toLowerCase().includes(query) ||
      anomaly.location.toLowerCase().includes(query) ||
      anomaly.id.toLowerCase().includes(query)
    );
  }, [anomalies, searchQuery]);

  return (
    <div>
      <SearchBox 
        onSearch={setSearchQuery} 
        placeholder="Search anomalies by name, classification, status, location, or ID..."
      />
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Anomaly ID</th>
            <th>Classification</th>
            <th>Status</th>
            <th>Discovery Date</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAnomalies.length === 0 ? (
            <tr>
              <td colSpan={7} style="text-align: center; padding: 20px;">
                No anomalies found matching your search.
              </td>
            </tr>
          ) : (
            filteredAnomalies.map(anomaly => (
              <tr key={anomaly.id}>
                <td>{anomaly.name}</td>
                <td>{anomaly.id}</td>
                <td>{anomaly.classification}</td>
                <td>{anomaly.status}</td>
                <td>{anomaly.discoveryDate}</td>
                <td>{anomaly.location}</td>
                <td>
                  <a href={`/anomalies/${anomaly.id.toUpperCase()}`}>
                    <button>View Full Report</button>
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
