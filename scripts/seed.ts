import { seedDemoData } from "../src/lib/seeds/demo-seeder";
import mongoose from "mongoose";

async function main() {
  console.log("🌱 Starting ExpenseFlow database seed...");
  const uri = process.env.MONGODB_URI;
  console.log(`📡 MongoDB Target: ${uri ? uri.replace(/\/\/.*@/, "//<credentials>@") : "Not set!"}`);

  try {
    const result = await seedDemoData();
    console.log("✅ Database seeded successfully!");
    console.log("📊 Summary of seeded entities:");
    console.log(`   - User Account: ${result.name} (${result.email})`);
    console.log(`   - Demo Password: ${result.password}`);
    console.log(`   - Accounts: ${result.accountsCount}`);
    console.log(`   - Categories: ${result.categoriesCount}`);
    console.log(`   - Transactions: ${result.transactionsCount}`);
    console.log(`   - Active Budgets: ${result.budgetsCount}`);
    console.log(`   - Recurring Rules: ${result.recurringCount}`);
    console.log(`   - Upcoming/Tracked Bills: ${result.billsCount}`);
    console.log(`   - Savings Goals: ${result.goalsCount}`);
  } catch (err) {
    console.error("❌ Seed failed with error:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

main();
