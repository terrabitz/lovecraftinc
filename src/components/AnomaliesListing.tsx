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

type SortField = 'name' | 'id' | 'classification' | 'status' | 'discoveryDate' | 'location';
type SortDirection = 'asc' | 'desc';

export default function AnomaliesListing({ anomalies }: AnomaliesListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedAnomalies = useMemo(() => {
    let result = anomalies;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(anomaly => 
        anomaly.name.toLowerCase().includes(query) ||
        anomaly.classification.toLowerCase().includes(query) ||
        anomaly.status.toLowerCase().includes(query) ||
        anomaly.location.toLowerCase().includes(query) ||
        anomaly.id.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const aValue = String(a[sortField]).toLowerCase();
      const bValue = String(b[sortField]).toLowerCase();
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [anomalies, searchQuery, sortField, sortDirection]);

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const handleKeyDown = (e: KeyboardEvent, field: SortField) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(field);
    }
  };

  return (
    <div style="width: 100%;">
      <SearchBox 
        onSearch={setSearchQuery} 
        placeholder="Search anomalies by name, classification, status, location, or ID..."
      />
      
      <div class="listing-container">
        <div class="table-wrapper">
          <table class="listing-table">
            <thead>
              <tr>
                <th 
                  style="cursor: pointer;" 
                  onClick={() => handleSort('id')}
                  onKeyDown={(e) => handleKeyDown(e, 'id')}
                  role="button"
                  tabIndex={0}
                >
                  ID{getSortIndicator('id')}
                </th>
                <th 
                  style="cursor: pointer;" 
                  onClick={() => handleSort('name')}
                  onKeyDown={(e) => handleKeyDown(e, 'name')}
                  role="button"
                  tabIndex={0}
                >
                  Name{getSortIndicator('name')}
                </th>
                <th 
                  class="hide-mobile"
                  style="cursor: pointer;" 
                  onClick={() => handleSort('classification')}
                  onKeyDown={(e) => handleKeyDown(e, 'classification')}
                  role="button"
                  tabIndex={0}
                >
                  Classification{getSortIndicator('classification')}
                </th>
                <th 
                  class="hide-tablet"
                  style="cursor: pointer;" 
                  onClick={() => handleSort('status')}
                  onKeyDown={(e) => handleKeyDown(e, 'status')}
                  role="button"
                  tabIndex={0}
                >
                  Status{getSortIndicator('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAnomalies.length === 0 ? (
                <tr>
                  <td colSpan={4} style="text-align: center; padding: 20px;">
                    No anomalies found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAndSortedAnomalies.map(anomaly => (
                  <tr 
                    key={anomaly.id}
                    class={selectedAnomaly?.id === anomaly.id ? 'selected' : ''}
                    onClick={() => setSelectedAnomaly(anomaly)}
                    style="cursor: pointer;"
                  >
                    <td>{anomaly.id}</td>
                    <td>{anomaly.name}</td>
                    <td class="hide-mobile">{anomaly.classification}</td>
                    <td class="hide-tablet">{anomaly.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {selectedAnomaly && (
          <div class="detail-panel">
            <h3>{selectedAnomaly.name}</h3>
            <div class="detail-content">
              <div class="detail-row">
                <strong>Anomaly ID:</strong>
                <span>{selectedAnomaly.id}</span>
              </div>
              <div class="detail-row">
                <strong>Classification:</strong>
                <span>{selectedAnomaly.classification}</span>
              </div>
              <div class="detail-row">
                <strong>Status:</strong>
                <span>{selectedAnomaly.status}</span>
              </div>
              <div class="detail-row">
                <strong>Discovery Date:</strong>
                <span>{selectedAnomaly.discoveryDate}</span>
              </div>
              <div class="detail-row">
                <strong>Location:</strong>
                <span>{selectedAnomaly.location}</span>
              </div>
              <div class="detail-actions">
                <a href={`/anomalies/${selectedAnomaly.id.toUpperCase()}`}>
                  <button>View Full Report</button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
