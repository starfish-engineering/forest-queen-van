# Product Strategy: Lookup vs Scout

## Two Distinct Products

CapEx Scout serves two fundamentally different user needs with two separate experiences:

---

## 🔍 LOOKUP MODE (Free / Basic)

### Purpose
Due diligence and research on a **specific address** the user already has in mind.

### User Intent
> "I found a property at 123 Main St. Tell me about this neighborhood."

### Entry Point
- Address search bar (top center)
- User types a specific address

### Features
- Address geocoding & autocomplete
- Census tract identification & display
- Neighborhood Score for that tract
- Permit history in the tract
- Adjacent tracts toggle
- Time horizon filtering (6mo, 1yr, 3yr)

### Value Proposition
- Quick due diligence check
- Understand neighborhood trajectory
- Validate/invalidate a lead

### Status: ✅ MVP COMPLETE

---

## 🎯 SCOUT MODE (Paid Product)

### Purpose
**Discover investment opportunities** by identifying neighborhoods with growth signals.

### User Intent
> "Find me neighborhoods that are improving. Show me where the action is."

### Entry Point
- **"Scout" tab/button** - distinct mode switch
- Default view: city-wide map with opportunity heatmap
- No address required to start

### Core Features

#### 1. Opportunity Heatmap
- City-wide view showing investment hotspots
- Color intensity = investment momentum
- Interactive: click hotspot to drill in

#### 2. Neighborhood Rankings
- Sortable list of top-scoring census tracts
- Columns: Rank, Name, Score, Permits (6mo), Trend
- Filter by borough
- Click row → zoom to tract on map

#### 3. Trend Indicators
- **Rising** 📈 - Permit velocity increasing
- **Steady** ➡️ - Consistent activity
- **Cooling** 📉 - Activity declining
- Highlight "up and coming" areas (rising + moderate current)

#### 4. Smart Filters for Opportunity
- "Gentrification signals" filter:
  - Specialty coffee ☕
  - Wine bars 🍷
  - Boutique fitness 🏋️
  - Organic grocery 🥬
- "High-value permits" filter (>$500K)
- "New construction" filter

#### 5. Watchlist (Future)
- Save interesting neighborhoods
- Get alerts when scores change
- Export to CSV

### Value Proposition
- **Time savings**: Don't manually scan permits
- **Pattern recognition**: Surface trends humans miss
- **First-mover advantage**: Find neighborhoods before they're obvious

### Monetization Potential
- Subscription: $X/month for Scout mode access
- Tiered: Basic (top 10 list) → Pro (full rankings + alerts)
- Enterprise: API access for funds/syndicators

### Status: 🚧 BUILD NEXT

---

## Mode Switching UX

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────┬─────────────┐                              │
│  │   LOOKUP    │   SCOUT     │     🔍 Enter address...      │
│  │             │   ★ PRO     │                              │
│  └─────────────┴─────────────┘                              │
│                                                             │
│                     [MAP AREA]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Lookup → Scout Transition
- User researching address can switch to Scout to see broader context
- "See top neighborhoods in this borough" CTA

### Scout → Lookup Transition  
- User finds interesting neighborhood in rankings
- Click tract → enters Lookup mode for that area
- Seamless data continuity

---

## Implementation Priority

### Phase 1: Core Scout Experience
1. Mode toggle UI (Lookup ↔ Scout)
2. Neighborhood rankings panel
3. City-wide opportunity heatmap (existing, needs enhancement)
4. Click-to-drill-in from Scout to Lookup

### Phase 2: Smart Signals
1. Trend calculation (velocity change over time)
2. Trend indicators in UI (📈📉➡️)
3. "Rising neighborhoods" highlight

### Phase 3: Monetization Prep
1. Gated features (rankings limited without subscription)
2. Export functionality
3. Watchlist + alerts (requires auth)

---

## Success Metrics

| Metric | Lookup | Scout |
|--------|--------|-------|
| Primary | Time to insight | Leads generated |
| Secondary | Searches/session | Tracts viewed |
| Monetization | Free (lead-gen) | Subscription |

---

## Competitive Moat

1. **Data aggregation** - Unified view of permits + businesses + liquor
2. **Scoring algorithm** - Proprietary neighborhood momentum metric
3. **NYC focus** - Deep local data vs national generalists
4. **Leading indicators** - Permits predict price changes by 12-18mo

