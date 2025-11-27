# Testing Strategy

## Philosophy

**"Confidence through automation"**

Testing in CapEx Scout serves two purposes: traditional quality assurance, and enabling a tight feedback loop for AI-assisted development. Tests should be fast, deterministic, and provide clear signals when something breaks.

---

## Test Pyramid

```
                    ┌─────────┐
                    │   E2E   │  ← Browser tests (critical paths)
                   ─┴─────────┴─
                  ┌─────────────┐
                  │ Integration │  ← API routes + database
                 ─┴─────────────┴─
                ┌─────────────────┐
                │      Unit       │  ← Pure functions, components
               ─┴─────────────────┴─
```

| Layer | Coverage Target | Run Frequency |
|-------|-----------------|---------------|
| Unit | 80%+ for utilities, scoring, transforms | Every commit |
| Integration | All API endpoints | Every commit |
| E2E | Critical user paths | Pre-deploy, CI |

---

## Testing Stack

| Tool | Purpose | Version |
|------|---------|---------|
| Vitest | Unit & integration tests | 2.x |
| React Testing Library | Component testing | 14.x |
| Playwright | E2E browser testing | 1.x |
| MSW | API mocking for component tests | 2.x |
| @testing-library/user-event | User interaction simulation | 14.x |

### Installation

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8 \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  playwright @playwright/test \
  msw
```

---

## Unit Tests

### Configuration

`vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

`src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### Unit Test Examples

#### Utility Functions

`src/lib/utils/distance.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateDistance } from './distance';

describe('calculateDistance', () => {
  it('calculates distance between two NYC points', () => {
    // Times Square to Empire State Building (~0.6 miles)
    const distance = calculateDistance(
      40.7580, -73.9855,  // Times Square
      40.7484, -73.9857   // Empire State
    );
    
    expect(distance).toBeCloseTo(0.66, 1);
  });

  it('returns 0 for same location', () => {
    const distance = calculateDistance(40.7580, -73.9855, 40.7580, -73.9855);
    expect(distance).toBe(0);
  });

  it('handles edge cases at city boundaries', () => {
    // Staten Island to Bronx (~20 miles)
    const distance = calculateDistance(
      40.5795, -74.1502,  // Staten Island
      40.8448, -73.8648   // Bronx
    );
    
    expect(distance).toBeGreaterThan(15);
    expect(distance).toBeLessThan(25);
  });
});
```

#### Scoring Functions

`src/lib/utils/scoring.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTractScore, normalize } from './scoring';

describe('normalize', () => {
  it('returns 50 for average value', () => {
    expect(normalize(100, 100)).toBe(50);
  });

  it('caps at 100 for high values', () => {
    expect(normalize(500, 100)).toBe(100);
  });

  it('returns 0 for zero value', () => {
    expect(normalize(0, 100)).toBe(0);
  });
});

describe('calculateTractScore', () => {
  const cityAvg = {
    permitDensity: 10,
    totalPermitValue: 1000000,
    highEndBusinessCount: 5,
  };

  it('returns average score (50) for average metrics', () => {
    const metrics = {
      permitCount: 20,
      permitDensity: 10,
      totalPermitValue: 1000000,
      businessCount: 10,
      highEndBusinessCount: 5,
    };
    
    const score = calculateTractScore(metrics, cityAvg);
    expect(score).toBe(50);
  });

  it('returns high score for above-average metrics', () => {
    const metrics = {
      permitCount: 50,
      permitDensity: 25,
      totalPermitValue: 3000000,
      businessCount: 20,
      highEndBusinessCount: 15,
    };
    
    const score = calculateTractScore(metrics, cityAvg);
    expect(score).toBeGreaterThan(75);
  });
});
```

#### Date Utilities

`src/lib/utils/date.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDateCutoff } from './date';

describe('getDateCutoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 6 months ago for "6mo"', () => {
    const cutoff = getDateCutoff('6mo');
    expect(cutoff.toISOString().slice(0, 10)).toBe('2023-12-15');
  });

  it('returns 1 year ago for "1yr"', () => {
    const cutoff = getDateCutoff('1yr');
    expect(cutoff.toISOString().slice(0, 10)).toBe('2023-06-15');
  });

  it('returns 3 years ago for "3yr"', () => {
    const cutoff = getDateCutoff('3yr');
    expect(cutoff.toISOString().slice(0, 10)).toBe('2021-06-15');
  });
});
```

### Component Tests

`src/components/Filters/TimeToggle.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeToggle } from './TimeToggle';

describe('TimeToggle', () => {
  it('renders all time horizon options', () => {
    render(<TimeToggle value="1yr" onChange={() => {}} />);
    
    expect(screen.getByRole('button', { name: '6mo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1yr' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3yr' })).toBeInTheDocument();
  });

  it('highlights the active option', () => {
    render(<TimeToggle value="1yr" onChange={() => {}} />);
    
    const activeButton = screen.getByRole('button', { name: '1yr' });
    expect(activeButton).toHaveClass('bg-accent-primary');
  });

  it('calls onChange when option is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    
    render(<TimeToggle value="1yr" onChange={onChange} />);
    
    await user.click(screen.getByRole('button', { name: '3yr' }));
    
    expect(onChange).toHaveBeenCalledWith('3yr');
  });
});
```

---

## Integration Tests

### API Route Testing

`src/app/api/search/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';

// Mock database client
vi.mock('@/lib/db/client', () => ({
  db: {
    query: vi.fn(),
  },
}));

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns geocoded address with census tract', async () => {
    // Mock database response
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{
        geoid: '36047000100',
        name: 'Census Tract 1, Kings County',
        geometry: { type: 'Polygon', coordinates: [[]] },
      }],
    });

    const request = new NextRequest(
      'http://localhost:3000/api/search?q=123+Main+St+Brooklyn'
    );
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.censusTract).toBeDefined();
    expect(data.censusTract.geoid).toBe('36047000100');
  });

  it('returns 400 for missing query parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/search');
    
    const response = await GET(request);
    
    expect(response.status).toBe(400);
  });
});
```

### Database Query Tests

`src/lib/queries.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from './db/client';
import { getPermitsByTract, getTractWithAdjacent } from './queries';

// These tests require a test database
describe.skipIf(!process.env.TEST_DATABASE_URL)('Database Queries', () => {
  beforeAll(async () => {
    // Set up test data
    await db.execute(`
      INSERT INTO census_tracts (geoid, name, geometry)
      VALUES ('36047000100', 'Test Tract', ST_GeomFromText('POLYGON(...)'));
    `);
  });

  afterAll(async () => {
    // Clean up test data
    await db.execute(`DELETE FROM census_tracts WHERE geoid LIKE '36047000%'`);
  });

  it('fetches permits within a census tract', async () => {
    const permits = await getPermitsByTract('36047000100', '1yr', []);
    
    expect(Array.isArray(permits)).toBe(true);
  });

  it('fetches tract with adjacent tracts', async () => {
    const result = await getTractWithAdjacent('36047000100');
    
    expect(result.tract).toBeDefined();
    expect(Array.isArray(result.adjacentTracts)).toBe(true);
  });
});
```

---

## End-to-End Tests

### Playwright Configuration

`playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'e2e/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### E2E Test Examples

`e2e/search.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Address Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]');
  });

  test('search for an address and view census tract', async ({ page }) => {
    // Type in search bar
    const searchInput = page.getByPlaceholder('Enter an NYC address');
    await searchInput.fill('123 Main Street, Brooklyn');
    
    // Wait for autocomplete
    await page.waitForSelector('[data-testid="search-suggestions"]');
    
    // Select first suggestion
    await page.getByTestId('search-suggestion').first().click();
    
    // Verify census tract is highlighted
    await expect(page.getByTestId('census-tract-layer')).toBeVisible();
    
    // Verify score card appears
    await expect(page.getByTestId('score-card')).toBeVisible();
    
    // Verify score is a number between 0-100
    const scoreText = await page.getByTestId('score-value').textContent();
    const score = parseInt(scoreText || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('displays error for invalid address', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Enter an NYC address');
    await searchInput.fill('asdfasdfasdf');
    await searchInput.press('Enter');
    
    await expect(page.getByText(/no results found/i)).toBeVisible();
  });
});
```

`e2e/filters.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Filter Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Perform a search first to have data to filter
    await page.getByPlaceholder('Enter an NYC address').fill('Times Square, NY');
    await page.getByTestId('search-suggestion').first().click();
    await page.waitForSelector('[data-testid="permit-markers"]');
  });

  test('filter by permit type updates map markers', async ({ page }) => {
    // Open filter panel
    await page.getByTestId('filter-toggle').click();
    
    // Get initial marker count
    const initialCount = await page.getByTestId('permit-marker').count();
    
    // Uncheck all except "Multifamily Housing"
    await page.getByLabel('Major Renovations').uncheck();
    await page.getByLabel('Commercial TI').uncheck();
    
    // Wait for map to update
    await page.waitForTimeout(500);
    
    // Verify marker count changed
    const filteredCount = await page.getByTestId('permit-marker').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('time horizon toggle updates data', async ({ page }) => {
    // Get current permit count
    const countBefore = await page.getByTestId('total-permits').textContent();
    
    // Switch to 3yr
    await page.getByRole('button', { name: '3yr' }).click();
    
    // Wait for data refresh
    await page.waitForResponse(resp => resp.url().includes('/api/permits'));
    
    // Get new permit count
    const countAfter = await page.getByTestId('total-permits').textContent();
    
    // 3yr should have more permits than 1yr
    expect(parseInt(countAfter || '0')).toBeGreaterThan(parseInt(countBefore || '0'));
  });
});
```

`e2e/permit-details.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Permit Details Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Enter an NYC address').fill('Brooklyn Heights');
    await page.getByTestId('search-suggestion').first().click();
    await page.waitForSelector('[data-testid="permit-markers"]');
  });

  test('clicking a marker opens detail drawer', async ({ page }) => {
    // Click on a permit marker
    await page.getByTestId('permit-marker').first().click();
    
    // Verify drawer opens
    await expect(page.getByTestId('detail-drawer')).toBeVisible();
    
    // Verify drawer contains expected content
    await expect(page.getByTestId('permit-address')).toBeVisible();
    await expect(page.getByTestId('permit-type')).toBeVisible();
    await expect(page.getByTestId('distance-from-subject')).toBeVisible();
  });

  test('drawer closes when clicking X or outside', async ({ page }) => {
    await page.getByTestId('permit-marker').first().click();
    await expect(page.getByTestId('detail-drawer')).toBeVisible();
    
    // Close via X button
    await page.getByTestId('drawer-close').click();
    await expect(page.getByTestId('detail-drawer')).not.toBeVisible();
    
    // Open again
    await page.getByTestId('permit-marker').first().click();
    await expect(page.getByTestId('detail-drawer')).toBeVisible();
    
    // Close via Escape key
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('detail-drawer')).not.toBeVisible();
  });
});
```

---

## AI-Assisted Development Loop

### Overview

The testing infrastructure enables a closed-loop iteration workflow where an AI assistant can:

1. **Observe** the application via browser automation
2. **Verify** changes against expected behavior
3. **Iterate** based on test results
4. **Validate** fixes through re-running tests

```
┌─────────────────────────────────────────────────────────────┐
│                    AI-BROWSER FEEDBACK LOOP                  │
│                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │   Code   │───▶│  Run E2E │───▶│ Analyze  │             │
│   │  Change  │    │   Tests  │    │ Results  │             │
│   └──────────┘    └──────────┘    └──────────┘             │
│        ▲                               │                    │
│        │                               │                    │
│        │         ┌──────────┐          │                    │
│        └─────────│  Adjust  │◀─────────┘                    │
│                  │   Code   │                               │
│                  └──────────┘                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Browser Testing Commands

These npm scripts enable rapid iteration:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:headed": "playwright test --headed",
    "e2e:debug": "playwright test --debug",
    "e2e:report": "playwright show-report"
  }
}
```

### Snapshot Testing for Visual Regression

Playwright can capture screenshots for visual comparison:

`e2e/visual.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('map view matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]');
    await page.waitForTimeout(2000); // Wait for tiles to load
    
    await expect(page).toHaveScreenshot('map-initial.png', {
      maxDiffPixels: 100,
    });
  });

  test('search results view matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Enter an NYC address').fill('Williamsburg');
    await page.getByTestId('search-suggestion').first().click();
    await page.waitForSelector('[data-testid="score-card"]');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('search-results.png', {
      maxDiffPixels: 100,
    });
  });
});
```

### Interactive Browser Session for AI

For AI-assisted debugging, use headed mode with slow-mo:

```bash
# Run specific test in headed mode with slow motion
npx playwright test search.spec.ts --headed --slow-mo=500

# Run with browser inspector for debugging
PWDEBUG=1 npx playwright test search.spec.ts
```

### Structured Test Output for AI Parsing

Configure Playwright to output machine-readable results:

`playwright.config.ts` (additional reporter):

```typescript
reporter: [
  ['json', { outputFile: 'e2e/results.json' }],
],
```

The JSON output includes:

```json
{
  "suites": [
    {
      "title": "Address Search",
      "specs": [
        {
          "title": "search for an address and view census tract",
          "ok": true,
          "tests": [
            {
              "status": "passed",
              "duration": 3245
            }
          ]
        }
      ]
    }
  ],
  "stats": {
    "passed": 12,
    "failed": 1,
    "skipped": 0
  }
}
```

### AI Iteration Workflow

When using AI to iterate on the codebase:

#### 1. Run Tests and Capture Results

```bash
npm run e2e -- --reporter=json --output=e2e-results.json
```

#### 2. Analyze Failures

The AI can read `e2e-results.json` to identify:
- Which tests failed
- Error messages and stack traces
- Screenshots of failure states

#### 3. Use Browser MCP for Live Inspection

The AI can use browser tools to:
- Navigate to the application
- Take accessibility snapshots
- Interact with elements
- Verify visual state

Example workflow:

```
1. AI: "Run e2e tests to check current state"
   → npm run e2e
   
2. AI: "Navigate to http://localhost:3000 and snapshot"
   → browser_navigate + browser_snapshot
   
3. AI: "The score card isn't visible - let me check the component"
   → read_file src/components/Score/ScoreCard.tsx
   
4. AI: "Found the issue - missing conditional render"
   → search_replace to fix
   
5. AI: "Verify fix by re-running e2e test"
   → npm run e2e -- -g "score card"
```

### Test Data Management

For consistent E2E testing, use seeded test data:

`scripts/seed/test-data.ts`:

```typescript
export async function seedTestData() {
  // Insert known census tracts
  await db.insert(censusTracts).values([
    {
      geoid: 'TEST001',
      name: 'Test Tract 1',
      geometry: testPolygon1,
      landAreaSqm: 1000000,
    },
  ]);
  
  // Insert known permits
  await db.insert(permits).values([
    {
      permitNumber: 'TEST-PERMIT-001',
      permitType: 'Alteration Type 1',
      filingDate: new Date('2024-01-15'),
      estimatedCost: 150000,
      latitude: 40.7128,
      longitude: -74.0060,
      censusTractGeoid: 'TEST001',
    },
  ]);
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

`.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:15-3.3
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: capex_test
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Setup database
        run: npm run db:migrate && npm run db:seed:test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/capex_test
      
      - name: Run E2E tests
        run: npm run e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/capex_test
          NEXT_PUBLIC_MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Coverage Requirements

### Minimum Coverage Thresholds

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Critical Paths (Must Test)

| Feature | Unit Tests | Integration | E2E |
|---------|-----------|-------------|-----|
| Distance calculation | ✓ | | |
| Scoring algorithm | ✓ | | |
| Date utilities | ✓ | | |
| API: /search | | ✓ | ✓ |
| API: /permits | | ✓ | ✓ |
| API: /census | | ✓ | |
| API: /heatmap | | ✓ | |
| Address search flow | | | ✓ |
| Filter interactions | | | ✓ |
| Time horizon toggle | ✓ | | ✓ |
| Permit detail drawer | | | ✓ |
| Map marker clustering | | | ✓ |

---

## Running Tests

### Quick Reference

```bash
# Unit tests
npm test                    # Run all unit tests
npm run test:watch          # Watch mode
npm run test:ui             # Visual UI
npm run test:coverage       # With coverage report

# E2E tests
npm run e2e                 # Run all E2E tests
npm run e2e:headed          # Run with browser visible
npm run e2e:ui              # Interactive UI mode
npm run e2e:debug           # Debug mode with inspector

# Specific test file
npm test -- distance.test.ts
npm run e2e -- search.spec.ts

# Specific test by name
npm test -- -t "calculateDistance"
npm run e2e -- -g "search for an address"
```

### Pre-commit Hook

`package.json`:

```json
{
  "scripts": {
    "precommit": "npm run test -- --run && npm run lint"
  }
}
```

---

## Debugging Failures

### Unit Test Debugging

```bash
# Run in debug mode
node --inspect-brk node_modules/vitest/vitest.mjs --run

# Use Vitest UI for visual debugging
npm run test:ui
```

### E2E Test Debugging

```bash
# Generate trace file for debugging
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip

# Run with browser developer tools
PWDEBUG=1 npx playwright test

# Pause on each action
await page.pause();
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Flaky map tests | Add explicit waits for tile loading |
| Stale element errors | Use auto-waiting locators |
| Database state pollution | Use transactions, rollback after each test |
| Slow E2E tests | Parallelize, mock external APIs |
| Missing Mapbox token | Use mock map layer in CI |

---

## File Structure

```
capex-scout/
├── src/
│   ├── test/
│   │   └── setup.ts              # Test setup file
│   ├── lib/
│   │   └── utils/
│   │       ├── distance.test.ts  # Unit tests alongside source
│   │       ├── scoring.test.ts
│   │       └── date.test.ts
│   ├── components/
│   │   └── Filters/
│   │       └── TimeToggle.test.tsx
│   └── app/
│       └── api/
│           └── search/
│               └── route.test.ts
├── e2e/
│   ├── search.spec.ts            # E2E test files
│   ├── filters.spec.ts
│   ├── permit-details.spec.ts
│   ├── visual.spec.ts
│   └── results.json              # Test output (gitignored)
├── playwright.config.ts
├── vitest.config.ts
└── playwright-report/            # HTML reports (gitignored)
```

