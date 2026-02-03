import { h } from 'preact';
import { useState } from 'preact/hooks';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBox({ onSearch, placeholder = "Search..." }: SearchBoxProps) {
  const [query, setQuery] = useState('');

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div style="margin-bottom: 12px;">
      <label for="search-input">Search: </label>
      <input
        id="search-input"
        type="text"
        value={query}
        onInput={handleInput}
        placeholder={placeholder}
        style="width: 300px;"
      />
    </div>
  );
}
