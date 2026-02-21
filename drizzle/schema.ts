import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // SaaS Plan
  plan: mysqlEnum("plan", ["none", "basic", "pro", "investor", "trial"]).default("none").notNull(),
  planActivatedAt: timestamp("planActivatedAt"),
  planExpiresAt: timestamp("planExpiresAt"),
  trialStartedAt: timestamp("trialStartedAt"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Immobilien-Tabelle: Gespeicherte Berechnungen pro User
 */
export const immobilien = mysqlTable("immobilien", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull().default("Mein Objekt"),
  art: mysqlEnum("art", ["etw", "mfh", "efh", "gewerbe", "neubau"]).default("etw").notNull(),
  standort: varchar("standort", { length: 255 }),
  eingaben: json("eingaben").notNull(),
  ergebnisse: json("ergebnisse"),
  szenarien: json("szenarien"),
  notizen: text("notizen"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Immobilie = typeof immobilien.$inferSelect;
export type InsertImmobilie = typeof immobilien.$inferInsert;