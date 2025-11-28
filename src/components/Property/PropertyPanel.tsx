'use client';

import { useAppStore } from '@/lib/store';
import { useNearbyPermits } from '@/lib/queries';
import { formatCurrency } from '@/lib/utils';

export function PropertyPanel() {
  const { 
    mode, 
    subjectAddress, 
    timeHorizon,
  } = useAppStore();

  // Fetch nearby permits by lat/lng
  const { data: permitsData, isLoading } = useNearbyPermits({
    lat: subjectAddress?.latitude,
    lng: subjectAddress?.longitude,
    timeHorizon,
    radius: 0.005, // ~500m radius
  });

  // Only show in Lookup mode when an address is selected
  if (mode !== 'lookup' || !subjectAddress) {
    return null;
  }

  const permits = permitsData?.permits || [];
  const totalCapital = permits.reduce((sum, p) => sum + (p.estimatedCost || 0), 0);

  return (
    <div className="absolute right-4 top-24 bottom-4 w-96 z-30 flex flex-col">
      <div className="glass rounded-xl border border-[var(--border-default)] shadow-2xl overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-primary-dim)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[var(--text-primary)] truncate">
                Property Lookup
              </h2>
              <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">
                {subjectAddress.formatted}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Location Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
              Location
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Address</span>
                <span className="text-sm text-[var(--text-primary)] text-right max-w-[200px] truncate">
                  {subjectAddress.formatted.split(',')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Coordinates</span>
                <span className="text-sm font-mono text-[var(--text-tertiary)]">
                  {subjectAddress.latitude.toFixed(4)}, {subjectAddress.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>


          {/* Permit Activity */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
              Nearby Activity ({timeHorizon})
            </h3>
            {isLoading ? (
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] animate-pulse">
                <div className="h-8 bg-[var(--bg-secondary)] rounded w-1/2 mb-2" />
                <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {permits.length}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Permits</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {totalCapital > 1000000 
                      ? `$${(totalCapital / 1000000).toFixed(1)}M` 
                      : formatCurrency(totalCapital)}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Capital</div>
                </div>
              </div>
            )}
          </div>

          {/* Permit Breakdown */}
          {permitsData?.byType && Object.keys(permitsData.byType).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                By Type
              </h3>
              <div className="space-y-2">
                {Object.entries(permitsData.byType).map(([permitType, count]) => (
                  count > 0 && (
                    <div key={permitType} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {permitType === 'NB' && '🏗️'}
                          {permitType === 'A1' && '🔧'}
                          {permitType === 'A2' && '🔨'}
                          {permitType === 'A3' && '🛠️'}
                          {permitType === 'DM' && '🏚️'}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {permitType === 'NB' ? 'New Building' : 
                           permitType === 'A1' ? 'Major Alteration' :
                           permitType === 'A2' ? 'Minor Alteration' :
                           permitType === 'A3' ? 'Renovation' :
                           permitType === 'DM' ? 'Demolition' : permitType}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{count}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Recent Permits List */}
          {permits.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                Recent Permits
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {permits.slice(0, 10).map((permit) => (
                  <div 
                    key={permit.id}
                    className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {permit.address}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                          {permit.permitType}
                        </p>
                      </div>
                      {permit.estimatedCost && (
                        <span className="text-xs font-mono text-[var(--accent-primary)] whitespace-nowrap">
                          {formatCurrency(permit.estimatedCost)}
                        </span>
                      )}
                    </div>
                    {permit.distanceFromSubject && (
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        {(permit.distanceFromSubject * 1000).toFixed(0)}m away
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

