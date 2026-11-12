/** @jsxImportSource preact */
import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import SearchBox from './SearchBox';
import styles from './DataListing.module.css';
import { matchesContent, metadataLabel, type ContentData } from '../../utils/content-data';

export type DataItem = ContentData;

// Column configuration
export interface ColumnConfig {
  key: string;
  label: string;
  metadata?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  sortable?: boolean;
  showInTable?: boolean;  // Whether to show in table (default: true)
}

export interface DataListingProps {
  data: DataItem[];
  columns: ColumnConfig[];
  emptyMessage: string;
  detailEmptyMessage: string;
  detailPath: string;
  detailButtonLabel: string;
}

type SortDirection = 'asc' | 'desc';

export default function DataListing({
  data,
  columns,
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
      result = result.filter(item => matchesContent(item, searchQuery));
    }

    // Apply sorting
    const column = columns.find(column => columnId(column) === sortField);
    result = [...result].sort((a, b) => {
      const aValue = column ? columnValue(a, column).toLowerCase() : '';
      const bValue = column ? columnValue(b, column).toLowerCase() : '';
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data, columns, searchQuery, sortField, sortDirection]);

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
      />
      
      <div class={styles.listingContainer}>
        <div class={styles.tableWrapper}>
          <table class={styles.listingTable}>
            <thead>
              <tr>
                {tableColumns.map(column => (
                  <th 
                    key={columnId(column)}
                    class={`${column.hideOnMobile ? styles.hideMobile : ''} ${column.hideOnTablet ? styles.hideTablet : ''}`.trim()}
                    style={column.sortable !== false ? "cursor: pointer;" : undefined}
                    onClick={column.sortable !== false ? () => handleSort(columnId(column)) : undefined}
                    onKeyDown={column.sortable !== false ? (e) => handleKeyDown(e, columnId(column)) : undefined}
                    role={column.sortable !== false ? "button" : undefined}
                    tabIndex={column.sortable !== false ? 0 : undefined}
                  >
                    {column.label}{column.sortable !== false ? getSortIndicator(columnId(column)) : ''}
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
                    class={selectedItem?.id === item.id ? styles.highlighted : ''}
                    onClick={() => setSelectedItem(item)}
                    style="cursor: pointer;"
                  >
                    {tableColumns.map(column => (
                      <td 
                        key={columnId(column)}
                        class={`${column.hideOnMobile ? styles.hideMobile : ''} ${column.hideOnTablet ? styles.hideTablet : ''}`.trim()}
                      >
                        {columnValue(item, column)}
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
                    <tr>
                      <td><strong>ID:</strong></td>
                      <td>{selectedItem.id}</td>
                    </tr>
                    <tr>
                      <td><strong>Name:</strong></td>
                      <td>{selectedItem.name}</td>
                    </tr>
                    {Object.entries(selectedItem.metadata).map(([key, value]) => (
                      <tr key={key}>
                        <td><strong>{metadataLabel(key)}:</strong></td>
                        <td>{value}</td>
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

function columnValue(item: DataItem, column: ColumnConfig): string {
  if (column.metadata) return Object.hasOwn(item.metadata, column.key) ? item.metadata[column.key] : '';
  return column.key === 'id' ? item.id : item.name;
}

function columnId(column: ColumnConfig): string {
  return column.metadata ? `metadata:${column.key}` : column.key;
}
