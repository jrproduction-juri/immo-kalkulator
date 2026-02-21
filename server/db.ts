import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { immobilien, InsertImmobilie, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPlan(
  userId: number,
  plan: "none" | "basic" | "pro" | "investor" | "trial",
  options?: { planExpiresAt?: Date | null; trialStartedAt?: Date | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users)
    .set({
      plan,
      planActivatedAt: new Date(),
      planExpiresAt: options?.planExpiresAt ?? null,
      trialStartedAt: options?.trialStartedAt ?? null,
    })
    .where(eq(users.id, userId));
}

// ─── Immobilien Helpers ──────────────────────────────────────────────────────

export async function createImmobilie(data: InsertImmobilie) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(immobilien).values(data);
  return result;
}

export async function getImmobilienByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(immobilien)
    .where(eq(immobilien.userId, userId))
    .orderBy(desc(immobilien.createdAt));
}

export async function getImmobilieById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(immobilien)
    .where(and(eq(immobilien.id, id), eq(immobilien.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateImmobilie(
  id: number,
  userId: number,
  data: Partial<InsertImmobilie>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(immobilien)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(immobilien.id, id), eq(immobilien.userId, userId)));
}

export async function deleteImmobilie(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(immobilien)
    .where(and(eq(immobilien.id, id), eq(immobilien.userId, userId)));
}

export async function countImmobilienByUser(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(immobilien).where(eq(immobilien.userId, userId));
  return result.length;
}
