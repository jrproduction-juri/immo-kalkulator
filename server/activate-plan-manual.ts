import { and, eq } from "drizzle-orm";
import { getDb } from "./db";
import { users } from "../drizzle/schema";

async function activatePlan() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Datenbankverbindung fehlgeschlagen");
    process.exit(1);
  }

  // User finden
  const result = await db.select().from(users).where(eq(users.email, "irt-test@outlook.de"));
  console.log("User gefunden:", result.length);

  if (result.length > 0) {
    const user = result[0];
    console.log("📋 Aktuelle Daten:");
    console.log("  ID:", user.id);
    console.log("  Name:", user.name);
    console.log("  Email:", user.email);
    console.log("  Plan:", user.plan);
    console.log("  Stripe Customer ID:", user.stripeCustomerId || "❌ KEINE");
    console.log("  Billing Type:", user.billingType);

    // Plan aktivieren
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 100);

    await db.update(users).set({
      plan: "investor",
      planActivatedAt: new Date(),
      planExpiresAt: expiresAt,
      billingType: "lifetime",
    }).where(eq(users.id, user.id));

    console.log("\n✅ Plan aktiviert!");
    console.log("  Neuer Plan: investor");
    console.log("  Gültig bis:", expiresAt.toISOString());
  } else {
    console.error("❌ User nicht gefunden");
  }

  process.exit(0);
}

activatePlan().catch(err => {
  console.error("❌ Fehler:", err);
  process.exit(1);
});
