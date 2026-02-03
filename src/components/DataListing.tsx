import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import SearchBox from './SearchBox';

// Generic type for any data item with at least an id and name
export interface DataItem {
  id: string;
  name: string;
  [key: string]: any;
}

// Column configuration
export interface ColumnConfig {
  key: string;
  label: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  sortable?: boolean;
}

// Detail field configuration for the detail panel
export interface DetailField {
  key: string;
  label: string;
}

export interface DataListingProps {
  data: DataItem[];
  columns: ColumnConfig[];
  detailFields: DetailField[];
  searchPlaceholder: string;
  emptyMessage: string;
  detailEmptyMessage: string;
  detailPath: string;
  detailButtonLabel: string;
}

type SortDirection = 'asc' | 'desc';

export default function DataListing({
  data,
  columns,
  detailFields,
  searchPlaceholder,
  emptyMessage,
  detailEmptyMessage,
  detailPath,
  detailButtonLabel
}: DataListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = data;

    // Apply search filter - search across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(query)
        )
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
  }, [data, searchQuery, sortField, sortDirection]);

  const getSortIndicator = (field: string) => {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const handleKeyDown = (e: KeyboardEvent, field: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(field);
    }
  };

  return (
    <div style="width: 100%;">
      <SearchBox 
        onSearch={setSearchQuery} 
        placeholder={searchPlaceholder}
      />
      
      <div class="listing-container">
        <div class="table-wrapper">
          <table class="listing-table">
            <thead>
              <tr>
                {columns.map(column => (
                  <th 
                    key={column.key}
                    class={`${column.hideOnMobile ? 'hide-mobile' : ''} ${column.hideOnTablet ? 'hide-tablet' : ''}`.trim()}
                    style={column.sortable !== false ? "cursor: pointer;" : undefined}
                    onClick={column.sortable !== false ? () => handleSort(column.key) : undefined}
                    onKeyDown={column.sortable !== false ? (e) => handleKeyDown(e, column.key) : undefined}
                    role={column.sortable !== false ? "button" : undefined}
                    tabIndex={column.sortable !== false ? 0 : undefined}
                  >
                    {column.label}{column.sortable !== false ? getSortIndicator(column.key) : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style="text-align: center; padding: 20px;">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map(item => (
                  <tr 
                    key={item.id}
                    class={selectedItem?.id === item.id ? 'selected' : ''}
                    onClick={() => setSelectedItem(item)}
                    style="cursor: pointer;"
                  >
                    {columns.map(column => (
                      <td 
                        key={column.key}
                        class={`${column.hideOnMobile ? 'hide-mobile' : ''} ${column.hideOnTablet ? 'hide-tablet' : ''}`.trim()}
                      >
                        {String(item[column.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div class="detail-panel">
          {selectedItem ? (
            <>
              <h3>{selectedItem.name}</h3>
              <div class="sunken-panel">
                <table>
                  <tbody>
                    {detailFields.map(field => (
                      <tr key={field.key}>
                        <td><strong>{field.label}</strong></td>
                        <td>{String(selectedItem[field.key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div class="detail-actions">
                <a href={`${detailPath}/${selectedItem.id.toUpperCase()}`}>
                  <button>{detailButtonLabel}</button>
                </a>
              </div>
            </>
          ) : (
            <div class="detail-empty">
              <p>{detailEmptyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

