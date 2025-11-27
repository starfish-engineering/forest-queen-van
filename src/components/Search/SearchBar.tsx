'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useGeocodeAutocomplete } from '@/lib/queries';
import { useAppStore } from '@/lib/store';
import { useDebounce } from '@/hooks/useDebounce';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  const { data: suggestions, isLoading } = useGeocodeAutocomplete(debouncedQuery);
  
  const { setSubjectAddress, setSubjectTract, setAdjacentTracts, setTractScores, clearAll } = useAppStore();

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(async (suggestion: {
    place_name: string;
    center: [number, number];
  }) => {
    setQuery(suggestion.place_name);
    setIsOpen(false);
    
    const [longitude, latitude] = suggestion.center;
    
    // Set subject address immediately for map fly-to
    setSubjectAddress({
      formatted: suggestion.place_name,
      longitude,
      latitude,
    });

    // Fetch census tract for this location
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(suggestion.place_name)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.censusTract) {
          setSubjectTract({
            geoid: data.censusTract.geoid,
            name: data.censusTract.name,
            countyFips: data.censusTract.countyFips,
            landAreaSqm: data.censusTract.landAreaSqm,
            geometry: data.censusTract.geometry,
    });

          // Store adjacent tracts (basic info from search API)
          if (data.adjacentTracts?.length > 0) {
            setAdjacentTracts(data.adjacentTracts.map((t: { geoid: string; name: string }) => ({
              geoid: t.geoid,
              name: t.name,
              countyFips: data.censusTract.countyFips,
              geometry: null, // Will be fetched when toggle is enabled
            })));
          }
          
          // Fetch real scores from census API
          const scoresResponse = await fetch(`/api/census/${data.censusTract.geoid}`);
          if (scoresResponse.ok) {
            const scoresData = await scoresResponse.json();
            if (scoresData.tract?.scores) {
              setTractScores(scoresData.tract.scores);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch census tract:', error);
    }
  }, [setSubjectAddress, setSubjectTract, setTractScores]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    clearAll();
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Enter an NYC address..."
          className="w-full h-12 pl-12 pr-24 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary-dim)] transition-all duration-200"
        />
        
        {/* Keyboard shortcut hint / Clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query ? (
            <button
              onClick={handleClear}
              className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-tertiary)]">
              <span className="text-sm">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && query.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl overflow-hidden z-50 animate-slide-in-up">
          {isLoading ? (
            <div className="px-4 py-3 text-[var(--text-secondary)]">
              <span className="animate-pulse">Searching...</span>
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.place_name}>
                  <button
                    onClick={() => handleSelect(suggestion)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                      index === selectedIndex
                        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-[var(--text-tertiary)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <span className="truncate">{suggestion.place_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-[var(--text-tertiary)]">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

