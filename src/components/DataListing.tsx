import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import SearchBox from './SearchBox';
import styles from './DataListing.module.css';

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
  showInTable?: boolean;  // Whether to show in table (default: true)
  showInDetail?: boolean; // Whether to show in detail panel (default: false for id/name)
}

export interface DataListingProps {
  data: DataItem[];
  columns: ColumnConfig[];
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

  // Filter columns for table display (default: showInTable !== false)
  const tableColumns = columns.filter(col => col.showInTable !== false);
  
  // Filter columns for detail display (showInDetail === true)
  const detailColumns = columns.filter(col => col.showInDetail === true);

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
      
      <div class={styles.listingContainer}>
        <div class={styles.tableWrapper}>
          <table class={styles.listingTable}>
            <thead>
              <tr>
                {tableColumns.map(column => (
                  <th 
                    key={column.key}
                    class={`${column.hideOnMobile ? styles.hideMobile : ''} ${column.hideOnTablet ? styles.hideTablet : ''}`.trim()}
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
                  <td colSpan={tableColumns.length} style="text-align: center; padding: 20px;">
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
                    {tableColumns.map(column => (
                      <td 
                        key={column.key}
                        class={`${column.hideOnMobile ? styles.hideMobile : ''} ${column.hideOnTablet ? styles.hideTablet : ''}`.trim()}
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
        
        <div class={styles.detailPanel}>
          {selectedItem ? (
            <>
              <div class="sunken-panel">
                <table>
                  <tbody>
                    {detailColumns.map(column => (
                      <tr key={column.key}>
                        <td><strong>{column.label}</strong></td>
                        <td>{String(selectedItem[column.key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div class={styles.detailActions}>
                <a href={`${detailPath}/${selectedItem.id.toUpperCase()}`}>
                  <button>{detailButtonLabel}</button>
                </a>
              </div>
            </>
          ) : (
            <div class={styles.detailEmpty}>
              <p>{detailEmptyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

