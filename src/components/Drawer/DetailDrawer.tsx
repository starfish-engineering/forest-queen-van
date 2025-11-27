'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, formatDistance } from '@/lib/utils';
import type { PermitCategory } from '@/types';

const CATEGORY_CONFIG: Record<PermitCategory, { icon: string; label: string; color: string }> = {
  building: { icon: '🏗️', label: 'Building Permit', color: 'var(--accent-primary)' },
  business: { icon: '🏪', label: 'Business License', color: 'var(--color-success)' },
  restaurant: { icon: '🍽️', label: 'Restaurant', color: 'var(--color-warning)' },
  liquor: { icon: '🍷', label: 'Liquor License', color: '#e040fb' },
};

export function DetailDrawer() {
  const { selectedPermit, closeDrawer } = useAppStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDrawer]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDrawer();
      }
    };

    // Delay to prevent immediate close
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDrawer]);

  if (!selectedPermit) return null;

  const config = CATEGORY_CONFIG[selectedPermit.category];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--bg-secondary)] border-l border-[var(--border-default)] z-50 shadow-2xl animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {config.label}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Permit Number */}
          <div>
            <h3 className="font-mono text-lg font-semibold text-[var(--text-primary)]">
              {selectedPermit.permitNumber}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {selectedPermit.permitType}
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-[var(--text-tertiary)] mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div>
                <p className="text-[var(--text-primary)]">{selectedPermit.address}</p>
                {selectedPermit.distanceFromSubject && (
                  <p className="text-sm text-[var(--accent-primary)]">
                    {formatDistance(selectedPermit.distanceFromSubject)} from subject property
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedPermit.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
                <span className="text-sm font-medium">Description</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed pl-7">
                {selectedPermit.description}
              </p>
            </div>
          )}

          {/* Estimated Cost */}
          {selectedPermit.estimatedCost && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                <span className="text-sm font-medium">Estimated Cost</span>
              </div>
              <p className="text-2xl font-mono font-bold text-[var(--text-primary)] pl-7">
                {formatCurrency(selectedPermit.estimatedCost)}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="text-sm font-medium">Dates</span>
            </div>
            <div className="pl-7 space-y-1">
              <p className="text-sm">
                <span className="text-[var(--text-tertiary)]">Filed:</span>{' '}
                <span className="text-[var(--text-primary)]">{formatDate(selectedPermit.filingDate)}</span>
              </p>
              {selectedPermit.issuanceDate && (
                <p className="text-sm">
                  <span className="text-[var(--text-tertiary)]">Issued:</span>{' '}
                  <span className="text-[var(--text-primary)]">{formatDate(selectedPermit.issuanceDate)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Category Badge */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
              style={{ 
                backgroundColor: `${config.color}20`,
                color: config.color,
              }}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

