# Mapbox Integration & Address Search

**Date:** November 27, 2025  
**Version:** 0.1.1  
**Status:** ✅ Complete

---

## Summary

Fixed Mapbox map rendering and implemented NYC-only address search autocomplete. The map now displays correctly and users can search for NYC addresses with results filtered to exclude locations outside the five boroughs.

---

## Issues Fixed

### 1. Map Not Rendering

**Problem:** The Mapbox map was showing a black screen instead of the actual map tiles.

**Root Cause:** 
- The Mapbox access token was being set at module load time (`mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN`) before the environment variable was available in the client-side code
- The map container needed explicit height/width styles

**Solution:**
- Moved token assignment inside the `useEffect` hook to ensure it's set at runtime
- Added explicit `w-full h-full` classes and `minHeight: '100vh'` style to the map container

### 2. Search Results Included Non-NYC Addresses

**Problem:** Searching for addresses like "123 Broadway" returned results from New Jersey (Newark, Jersey City, etc.) alongside NYC results.

**Root Cause:** The Mapbox Geocoding API's `bbox` parameter only biases results toward the bounding box but doesn't strictly filter them.

**Solution:**
- Added `proximity` parameter pointing to Midtown Manhattan to improve result relevance
- Implemented client-side filtering with `isNYCAddress()` function that:
  - Checks for "New York" state in the address
  - Explicitly excludes "New Jersey" and ", NJ" results
  - Validates against known NYC borough/area names

---

## Files Modified

### `src/components/Map/Map.tsx`

```diff
+ const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

+   // Set access token at runtime
+   const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
+   if (!token) {
+     console.error('Mapbox token not found');
+     return;
+   }
+   mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      ...
    });
  }, []);

  // Marker cleanup on address change
+ if (markerRef.current) {
+   markerRef.current.remove();
+ }
+ markerRef.current = new mapboxgl.Marker({ color: '#00d4ff' })

  return (
    <div 
      ref={mapContainer} 
-     className="absolute inset-0"
+     className="absolute inset-0 w-full h-full"
-     style={{ background: 'var(--bg-primary)' }}
+     style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}
    />
  );
```

### `src/lib/queries.ts`

```diff
+ // NYC borough/area names to filter results
+ const NYC_AREAS = [
+   'new york', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island',
+   'new york city', 'nyc'
+ ];

+ function isNYCAddress(suggestion: GeocodeSuggestion): boolean {
+   const placeName = suggestion.place_name.toLowerCase();
+   const hasNYState = placeName.includes(', new york');
+   const hasNYCArea = NYC_AREAS.some(area => placeName.includes(area));
+   
+   // Exclude New Jersey results
+   if (placeName.includes('new jersey') || placeName.includes(', nj')) {
+     return false;
+   }
+   
+   return hasNYState || hasNYCArea;
+ }

  // In useGeocodeAutocomplete:
  const bbox = '-74.259,40.477,-73.700,40.917';
+ const proximity = '-73.9857,40.7484'; // Midtown Manhattan
  
  const res = await fetch(
    `...&bbox=${bbox}&` +
+   `proximity=${proximity}&` +
    `types=address&` +
-   `limit=5`
+   `limit=10` // Fetch more, then filter
  );
  
+ // Filter to only NYC addresses and limit to 5
+ const nycResults = (data.features || [])
+   .filter(isNYCAddress)
+   .slice(0, 5);
+ 
+ return nycResults;
```

---

## Testing Performed

1. **Map Loading:** Verified map tiles load correctly on page load
2. **Address Search:** Tested "133 Avenue D" - correctly shows Manhattan result first
3. **NYC Filtering:** Verified New Jersey addresses are excluded from results
4. **Fly-to Animation:** Map smoothly animates to selected address
5. **Marker Placement:** Cyan marker correctly placed at searched location
6. **Marker Cleanup:** Old markers removed when new address selected

---

## Environment Setup

Created `.env.local` with:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token

---

## What's Next

- Load census tract boundaries from database
- Display census tract overlay when address selected
- Implement heatmap layer with permit data
- Connect filters to actual data queries

