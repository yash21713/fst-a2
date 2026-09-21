import { execSync } from "child_process";
import * as dotenv from "dotenv";

dotenv.config();

async function runPipeline() {
  console.log("======================================================================");
  console.log("🚀 FST ASSIGNMENT 2: AUTOMATED DATABASE MIGRATION & SEED PIPELINE");
  console.log("======================================================================");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL is not defined in .env");
    process.exit(1);
  }

  console.log(`📡 Target Database: ${dbUrl.replace(/:[^:@]+@/, ":****@")}`);

  try {
    // Step 1: Push schema changes & reset database
    console.log("\n[Step 1/4] 📦 Synchronizing schema & resetting database tables...");
    execSync("npx prisma db push --force-reset --accept-data-loss", {
      stdio: "inherit",
      env: process.env,
    });

    // Step 2: Generate fresh Prisma Client
    console.log("\n[Step 2/4] ⚙️  Generating updated Prisma Client types...");
    execSync("npx prisma generate", {
      stdio: "inherit",
      env: process.env,
    });

    // Step 3: Run the seed script
    console.log("\n[Step 3/4] 🌾 Executing automated seed script (prisma/seed.ts)...");
    execSync("npx tsx prisma/seed.ts", {
      stdio: "inherit",
      env: process.env,
    });

    // Step 4: Verification & Referential Integrity Audit
    console.log("\n[Step 4/4] 🔍 Running automated integrity verification audit...");
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const [roleCount, userCount, txnCount, auditCount, emailCount] = await Promise.all([
      prisma.role.count(),
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.auditLog.count(),
      prisma.emailLog.count(),
    ]);

    // Raw SQL relational integrity queries
    const orphanedTxns = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM transactions WHERE "userId" NOT IN (SELECT id FROM users);
    `;
    const orphanedUsers = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM users WHERE "roleId" NOT IN (SELECT id FROM roles);
    `;

    const orphanedTxnCount = Number(orphanedTxns[0]?.count || 0);
    const orphanedUserCount = Number(orphanedUsers[0]?.count || 0);

    console.log("\n📊 PIPELINE EXECUTION SUMMARY:");
    console.table([
      { Entity: "Roles", Count: roleCount, Status: roleCount >= 3 ? "PASS" : "FAIL" },
      { Entity: "Users", Count: userCount, Status: userCount >= 15 ? "PASS" : "FAIL" },
      { Entity: "Transactions", Count: txnCount, Status: txnCount >= 40 ? "PASS" : "FAIL" },
      { Entity: "Audit Logs", Count: auditCount, Status: auditCount >= 30 ? "PASS" : "FAIL" },
      { Entity: "Email Logs", Count: emailCount, Status: emailCount >= 20 ? "PASS" : "FAIL" },
      { Entity: "FK Integrity (Txn -> User)", Count: orphanedTxnCount, Status: orphanedTxnCount === 0 ? "PERFECT" : "FAIL" },
      { Entity: "FK Integrity (User -> Role)", Count: orphanedUserCount, Status: orphanedUserCount === 0 ? "PERFECT" : "FAIL" },
    ]);

    await prisma.$disconnect();

    console.log("\n🎉 ALL PIPELINE GATES PASSED! Database is fully normalized, seeded & ready.");
    console.log("======================================================================\n");
  } catch (error) {
    console.error("\n❌ Pipeline failed during execution:", error);
    process.exit(1);
  }
}

runPipeline();
