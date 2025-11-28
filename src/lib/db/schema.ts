import { pgTable, serial, varchar, text, date, timestamp, numeric, boolean, jsonb, unique, index, doublePrecision, integer } from 'drizzle-orm/pg-core';

// Census tract boundaries (pre-loaded from Census Bureau)
export const censusTracts = pgTable('census_tracts', {
  id: serial('id').primaryKey(),
  geoid: varchar('geoid', { length: 11 }).unique().notNull(), // e.g., "36061000100"
  stateFips: varchar('state_fips', { length: 2 }).notNull(),  // "36" for NY
  countyFips: varchar('county_fips', { length: 3 }).notNull(), // "061" for Manhattan
  tractCode: varchar('tract_code', { length: 6 }).notNull(),
  name: varchar('name', { length: 100 }),
  // Geometry stored as text (GeoJSON) - PostGIS operations done via raw SQL
  geometry: text('geometry').notNull(),
  landAreaSqm: doublePrecision('land_area_sqm'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_census_tracts_geoid').on(table.geoid),
]);

// Building permits from NYC DOB
export const permits = pgTable('permits', {
  id: serial('id').primaryKey(),
  permitNumber: varchar('permit_number', { length: 50 }).unique().notNull(),
  permitType: varchar('permit_type', { length: 100 }).notNull(),
  permitSubtype: varchar('permit_subtype', { length: 100 }),
  description: text('description'),
  filingDate: date('filing_date').notNull(),
  issuanceDate: date('issuance_date'),
  expirationDate: date('expiration_date'),
  estimatedCost: doublePrecision('estimated_cost'),
  address: varchar('address', { length: 255 }),
  borough: varchar('borough', { length: 20 }),
  block: varchar('block', { length: 10 }),
  lot: varchar('lot', { length: 10 }),
  bin: varchar('bin', { length: 10 }), // Building Identification Number
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  censusTractGeoid: varchar('census_tract_geoid', { length: 11 }),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_permits_filing_date').on(table.filingDate),
  index('idx_permits_census_tract').on(table.censusTractGeoid),
  index('idx_permits_type').on(table.permitType),
]);

// Business licenses
export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  licenseNumber: varchar('license_number', { length: 50 }).unique().notNull(),
  businessName: varchar('business_name', { length: 255 }),
  businessType: varchar('business_type', { length: 100 }).notNull(), // restaurant, retail, coffee, etc.
  licenseType: varchar('license_type', { length: 100 }),
  licenseStatus: varchar('license_status', { length: 50 }),
  issueDate: date('issue_date'),
  expirationDate: date('expiration_date'),
  address: varchar('address', { length: 255 }),
  borough: varchar('borough', { length: 20 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  censusTractGeoid: varchar('census_tract_geoid', { length: 11 }),
  isHighEndIndicator: boolean('is_high_end_indicator').default(false), // flagged as "bougie"
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_businesses_type').on(table.businessType),
  index('idx_businesses_census_tract').on(table.censusTractGeoid),
]);

// Liquor licenses (NYC SLA)
export const liquorLicenses = pgTable('liquor_licenses', {
  id: serial('id').primaryKey(),
  serialNumber: varchar('serial_number', { length: 50 }).unique().notNull(),
  licenseType: varchar('license_type', { length: 100 }),
  premisesName: varchar('premises_name', { length: 255 }),
  dba: varchar('dba', { length: 255 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  zip: varchar('zip', { length: 10 }),
  county: varchar('county', { length: 50 }),
  licenseIssueDate: date('license_issue_date'),
  licenseExpirationDate: date('license_expiration_date'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  censusTractGeoid: varchar('census_tract_geoid', { length: 11 }),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_liquor_licenses_census_tract').on(table.censusTractGeoid),
]);

// Pre-computed tract scores (refreshed daily)
export const tractScores = pgTable('tract_scores', {
  id: serial('id').primaryKey(),
  censusTractGeoid: varchar('census_tract_geoid', { length: 11 }).notNull(),
  timeHorizon: varchar('time_horizon', { length: 10 }).notNull(), // '6mo', '1yr', '3yr'
  totalPermits: integer('total_permits').default(0),
  totalPermitValue: doublePrecision('total_permit_value').default(0),
  permitDensity: doublePrecision('permit_density'), // permits per sq km
  businessCount: integer('business_count').default(0),
  highEndBusinessCount: integer('high_end_business_count').default(0),
  compositeScore: doublePrecision('composite_score'),
  computedAt: timestamp('computed_at').defaultNow(),
}, (table) => [
  unique('tract_scores_unique').on(table.censusTractGeoid, table.timeHorizon),
  index('idx_tract_scores_lookup').on(table.censusTractGeoid, table.timeHorizon),
]);

// Types for TypeScript
export type CensusTract = typeof censusTracts.$inferSelect;
export type NewCensusTract = typeof censusTracts.$inferInsert;

export type Permit = typeof permits.$inferSelect;
export type NewPermit = typeof permits.$inferInsert;

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;

export type LiquorLicense = typeof liquorLicenses.$inferSelect;
export type NewLiquorLicense = typeof liquorLicenses.$inferInsert;

export type TractScore = typeof tractScores.$inferSelect;
export type NewTractScore = typeof tractScores.$inferInsert;

