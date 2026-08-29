import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { UserSettings } from "@/models/UserSettings";
import { Account } from "@/models/Account";
import { Category } from "@/models/Category";
import { Transaction } from "@/models/Transaction";
import { Budget } from "@/models/Budget";
import { RecurringRule } from "@/models/RecurringRule";
import { Bill } from "@/models/Bill";
import { Goal } from "@/models/Goal";
import { AuditLog } from "@/models/AuditLog";
import { hashPassword } from "@/lib/auth/password";
import { subDays, subMonths, addDays, startOfMonth } from "date-fns";

export async function seedDemoData() {
  await connectToDatabase();

  try {
    await Transaction.collection.dropIndexes();
  } catch {}
  try {
    await Transaction.syncIndexes();
  } catch {}

  const email = "demo@expenseflow.app";
  const rawPassword = "Password123!";
  const name = "Anuj Bansal";

  // 1. Clean up existing demo user if exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const uId = existingUser._id;
    await Promise.all([
      User.deleteOne({ _id: uId }),
      UserSettings.deleteMany({ userId: uId }),
      Account.deleteMany({ userId: uId }),
      Category.deleteMany({ userId: uId }),
      Transaction.deleteMany({ userId: uId }),
      Budget.deleteMany({ userId: uId }),
      RecurringRule.deleteMany({ userId: uId }),
      Bill.deleteMany({ userId: uId }),
      Goal.deleteMany({ userId: uId }),
      AuditLog.deleteMany({ userId: uId }),
    ]);
  }

  // 2. Create Demo User
  const passwordHash = await hashPassword(rawPassword);
  const user = await User.create({
    name,
    email,
    passwordHash,
    status: "active",
  });
  const userId = user._id;

  // 3. Create Settings
  await UserSettings.create({
    userId,
    baseCurrency: "INR",
    timezone: "Asia/Kolkata",
    locale: "en-IN",
    dateFormat: "dd MMM yyyy",
    theme: "dark",
    weekStartsOn: 1,
  });

  // 4. Create Accounts
  const [hdfc, icici, cash, amex] = await Account.create([
    {
      userId,
      name: "HDFC Salary Bank",
      type: "bank",
      currency: "INR",
      openingBalanceMinor: 8500000, // ₹85,000.00
      isArchived: false,
    },
    {
      userId,
      name: "ICICI Wealth Savings",
      type: "savings",
      currency: "INR",
      openingBalanceMinor: 25000000, // ₹2,50,000.00
      isArchived: false,
    },
    {
      userId,
      name: "Cash Wallet",
      type: "cash",
      currency: "INR",
      openingBalanceMinor: 650000, // ₹6,500.00
      isArchived: false,
    },
    {
      userId,
      name: "Amex Platinum Credit Card",
      type: "credit_card",
      currency: "INR",
      openingBalanceMinor: 0,
      isArchived: false,
    },
  ]);

  // 5. Create Categories
  const categories = await Category.create([
    // Income
    { userId, name: "Salary", type: "income", colorToken: "#10b981", icon: "Briefcase" },
    { userId, name: "Freelance & Consulting", type: "income", colorToken: "#06b6d4", icon: "Laptop" },
    { userId, name: "Investments & Dividends", type: "income", colorToken: "#8b5cf6", icon: "TrendingUp" },
    { userId, name: "Cashback & Rewards", type: "income", colorToken: "#f59e0b", icon: "Sparkles" },

    // Expenses
    { userId, name: "Housing & Rent", type: "expense", colorToken: "#ec4899", icon: "Building" },
    { userId, name: "Groceries & Supermarket", type: "expense", colorToken: "#10b981", icon: "ShoppingCart" },
    { userId, name: "Dining & Cafes", type: "expense", colorToken: "#f97316", icon: "Coffee" },
    { userId, name: "Utilities & Bills", type: "expense", colorToken: "#eab308", icon: "Zap" },
    { userId, name: "Entertainment & OTT", type: "expense", colorToken: "#a855f7", icon: "Film" },
    { userId, name: "Healthcare & Fitness", type: "expense", colorToken: "#ef4444", icon: "HeartPulse" },
    { userId, name: "Travel & Commute", type: "expense", colorToken: "#3b82f6", icon: "Car" },
    { userId, name: "Tech & Gadgets", type: "expense", colorToken: "#6366f1", icon: "Monitor" },
    { userId, name: "Shopping & Lifestyle", type: "expense", colorToken: "#14b8a6", icon: "ShoppingBag" },
  ]);

  const catMap: Record<string, any> = {};
  for (const c of categories) {
    catMap[c.name] = c;
  }

  // 6. Generate Realistic Transactions (Current month and Previous month)
  const now = new Date();
  const txList: any[] = [];

  // Previous Month Salary & Incomes
  txList.push({
    userId,
    accountId: hdfc._id,
    categoryId: catMap["Salary"]._id,
    type: "income",
    amountMinor: 15000000, // ₹1,50,000
    currency: "INR",
    occurredAt: subMonths(subDays(now, 20), 1),
    merchant: "Acme Corp Tech",
    description: "Monthly Software Engineering Salary",
  });

  txList.push({
    userId,
    accountId: hdfc._id,
    categoryId: catMap["Freelance & Consulting"]._id,
    type: "income",
    amountMinor: 4500000, // ₹45,000
    currency: "INR",
    occurredAt: subMonths(subDays(now, 10), 1),
    merchant: "FinTech Consulting Client",
    description: "Next.js Architecture Review",
  });

  // Current Month Salary
  txList.push({
    userId,
    accountId: hdfc._id,
    categoryId: catMap["Salary"]._id,
    type: "income",
    amountMinor: 15000000, // ₹1,50,000
    currency: "INR",
    occurredAt: subDays(now, 18),
    merchant: "Acme Corp Tech",
    description: "Monthly Software Engineering Salary",
  });

  // Rent payments
  txList.push({
    userId,
    accountId: hdfc._id,
    categoryId: catMap["Housing & Rent"]._id,
    type: "expense",
    amountMinor: 3500000, // ₹35,000
    currency: "INR",
    occurredAt: subMonths(subDays(now, 15), 1),
    merchant: "Skyline Residency",
    description: "Monthly Apartment Rent",
  });

  txList.push({
    userId,
    accountId: hdfc._id,
    categoryId: catMap["Housing & Rent"]._id,
    type: "expense",
    amountMinor: 3500000, // ₹35,000
    currency: "INR",
    occurredAt: subDays(now, 15),
    merchant: "Skyline Residency",
    description: "Monthly Apartment Rent",
  });

  // Groceries & Supermarket
  const groceryStores = ["Blinkit Express", "Zepto Quick", "Nature's Basket", "Whole Foods Market", "Swiggy Instamart"];
  const groceryAmounts = [145000, 238000, 420000, 189000, 312000, 165000];
  groceryAmounts.forEach((amt, idx) => {
    txList.push({
      userId,
      accountId: idx % 2 === 0 ? hdfc._id : amex._id,
      categoryId: catMap["Groceries & Supermarket"]._id,
      type: "expense",
      amountMinor: amt,
      currency: "INR",
      occurredAt: subDays(now, (idx + 1) * 3),
      merchant: groceryStores[idx % groceryStores.length],
      description: "Weekly organic vegetables and pantry staples",
    });
  });

  // Dining & Cafes
  const diningSpots = ["Blue Tokai Coffee", "Starbucks Reserve", "Olive Beach Bistro", "Social Kitchen & Bar", "Third Wave Coffee"];
  const diningAmounts = [45000, 125000, 385000, 245000, 68000, 195000, 210000];
  diningAmounts.forEach((amt, idx) => {
    txList.push({
      userId,
      accountId: idx % 2 === 0 ? amex._id : cash._id,
      categoryId: catMap["Dining & Cafes"]._id,
      type: "expense",
      amountMinor: amt,
      currency: "INR",
      occurredAt: subDays(now, (idx + 1) * 2),
      merchant: diningSpots[idx % diningSpots.length],
      description: "Weekend team lunch and artisanal coffee",
    });
  });

  // Entertainment & OTT
  txList.push({
    userId,
    accountId: amex._id,
    categoryId: catMap["Entertainment & OTT"]._id,
    type: "expense",
    amountMinor: 64900, // ₹649
    currency: "INR",
    occurredAt: subDays(now, 14),
    merchant: "Netflix India",
    description: "4K UHD Monthly Subscription",
  });

  txList.push({
    userId,
    accountId: amex._id,
    categoryId: catMap["Entertainment & OTT"]._id,
    type: "expense",
    amountMinor: 119000, // ₹1,190
    currency: "INR",
    occurredAt: subDays(now, 8),
    merchant: "Spotify Family",
    description: "Annual Premium Music Plan",
  });

  txList.push({
    userId,
    accountId: amex._id,
    categoryId: catMap["Entertainment & OTT"]._id,
    type: "expense",
    amountMinor: 380000, // ₹3,800
    currency: "INR",
    occurredAt: subDays(now, 4),
    merchant: "PVR Director's Cut",
    description: "IMAX Movie Experience with dinner",
  });

  // Tech & Gadgets
  txList.push({
    userId,
    accountId: amex._id,
    categoryId: catMap["Tech & Gadgets"]._id,
    type: "expense",
    amountMinor: 899000, // ₹8,990
    currency: "INR",
    occurredAt: subDays(now, 6),
    merchant: "Keychron India",
    description: "Q1 Pro Wireless Mechanical Keyboard",
  });

  // Transfers
  txList.push({
    userId,
    accountId: hdfc._id,
    destinationAccountId: icici._id,
    type: "transfer",
    amountMinor: 4000000, // ₹40,000
    currency: "INR",
    occurredAt: subDays(now, 16),
    merchant: "Internal Transfer",
    description: "Monthly automated savings transfer to Wealth Account",
  });

  txList.push({
    userId,
    accountId: hdfc._id,
    destinationAccountId: cash._id,
    type: "transfer",
    amountMinor: 500000, // ₹5,000
    currency: "INR",
    occurredAt: subDays(now, 11),
    merchant: "ATM Cash Withdrawal",
    description: "HDFC ATM Cash withdrawal for daily pocket expenses",
  });

  await Transaction.create(txList);

  // 7. Create Budgets
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  await Budget.create([
    {
      userId,
      name: "Groceries & Supermarket Budget",
      categoryId: catMap["Groceries & Supermarket"]._id,
      limitAmountMinor: 2500000, // ₹25,000 limit
      currency: "INR",
      warningThreshold: 80,
      period: "monthly",
      isActive: true,
    },
    {
      userId,
      name: "Dining & Cafes Budget",
      categoryId: catMap["Dining & Cafes"]._id,
      limitAmountMinor: 1500000, // ₹15,000 limit
      currency: "INR",
      warningThreshold: 80,
      period: "monthly",
      isActive: true,
    },
    {
      userId,
      name: "Entertainment & OTT Budget",
      categoryId: catMap["Entertainment & OTT"]._id,
      limitAmountMinor: 500000, // ₹5,000 limit (will show exceeded)
      currency: "INR",
      warningThreshold: 80,
      period: "monthly",
      isActive: true,
    },
    {
      userId,
      name: "Tech & Gadgets Budget",
      categoryId: catMap["Tech & Gadgets"]._id,
      limitAmountMinor: 2000000, // ₹20,000 limit
      currency: "INR",
      warningThreshold: 80,
      period: "monthly",
      isActive: true,
    },
  ]);

  // 8. Create Recurring Rules
  await RecurringRule.create([
    {
      userId,
      type: "income",
      amountMinor: 15000000,
      currency: "INR",
      accountId: hdfc._id,
      categoryId: catMap["Salary"]._id,
      frequency: "monthly",
      interval: 1,
      startDate: startOfMonth(now),
      nextRunAt: addDays(now, 12),
      merchant: "Acme Corp Tech",
      notes: "Direct salary deposit on 1st",
      isActive: true,
    },
    {
      userId,
      type: "expense",
      amountMinor: 3500000,
      currency: "INR",
      accountId: hdfc._id,
      categoryId: catMap["Housing & Rent"]._id,
      frequency: "monthly",
      interval: 1,
      startDate: startOfMonth(now),
      nextRunAt: addDays(now, 16),
      merchant: "Skyline Residency",
      notes: "Automatic rent transfer",
      isActive: true,
    },
    {
      userId,
      type: "expense",
      amountMinor: 64900,
      currency: "INR",
      accountId: amex._id,
      categoryId: catMap["Entertainment & OTT"]._id,
      frequency: "monthly",
      interval: 1,
      startDate: startOfMonth(now),
      nextRunAt: addDays(now, 15),
      merchant: "Netflix Premium",
      isActive: true,
    },
    {
      userId,
      type: "expense",
      amountMinor: 250000,
      currency: "INR",
      accountId: hdfc._id,
      categoryId: catMap["Healthcare & Fitness"]._id,
      frequency: "monthly",
      interval: 1,
      startDate: startOfMonth(now),
      nextRunAt: addDays(now, 1),
      merchant: "Cult.fit Elite Gym",
      isActive: true,
    },
  ]);

  // 9. Create Bills
  await Bill.create([
    {
      userId,
      name: "Electricity Board (BESCOM)",
      amountMinor: 345000, // ₹3,450
      currency: "INR",
      dueDate: addDays(now, 4),
      status: "upcoming",
      categoryId: catMap["Utilities & Bills"]._id,
      accountId: hdfc._id,
      isRecurring: true,
    },
    {
      userId,
      name: "Airtel Fiber Broadband 1Gbps",
      amountMinor: 117900, // ₹1,179
      currency: "INR",
      dueDate: addDays(now, 9),
      status: "upcoming",
      categoryId: catMap["Utilities & Bills"]._id,
      accountId: amex._id,
      isRecurring: true,
    },
    {
      userId,
      name: "Postpaid Mobile Bill",
      amountMinor: 89900, // ₹899
      currency: "INR",
      dueDate: subDays(now, 2),
      status: "overdue",
      categoryId: catMap["Utilities & Bills"]._id,
      accountId: hdfc._id,
      isRecurring: true,
    },
    {
      userId,
      name: "Municipal Gas Piped Supply",
      amountMinor: 58000, // ₹580
      currency: "INR",
      dueDate: subDays(now, 10),
      status: "paid",
      categoryId: catMap["Utilities & Bills"]._id,
      accountId: hdfc._id,
      isRecurring: true,
    },
  ]);

  // 10. Create Savings Goals
  await Goal.create([
    {
      userId,
      name: "Emergency Reserve (6 Months)",
      targetAmountMinor: 50000000, // ₹5,00,000
      currentAmountMinor: 37500000, // ₹3,75,000 (75%)
      currency: "INR",
      targetDate: addDays(now, 180),
      colorToken: "#10b981",
      icon: "ShieldCheck",
      isArchived: false,
      contributions: [
        {
          amountMinor: 5000000,
          date: subDays(now, 40),
          notes: "Initial reserve allocation",
          accountId: icici._id,
        },
        {
          amountMinor: 4000000,
          date: subDays(now, 16),
          notes: "Monthly savings transfer",
          accountId: icici._id,
        },
      ],
    },
    {
      userId,
      name: "Tokyo Vacation 2027",
      targetAmountMinor: 25000000, // ₹2,50,000
      currentAmountMinor: 9500000, // ₹95,000 (38%)
      currency: "INR",
      targetDate: addDays(now, 320),
      colorToken: "#f59e0b",
      icon: "Plane",
      isArchived: false,
      contributions: [
        {
          amountMinor: 2500000,
          date: subDays(now, 25),
          notes: "Flight tickets fund deposit",
          accountId: hdfc._id,
        },
      ],
    },
    {
      userId,
      name: "Apple M4 Pro Studio Setup",
      targetAmountMinor: 22000000, // ₹2,20,000
      currentAmountMinor: 18000000, // ₹1,80,000 (81%)
      currency: "INR",
      targetDate: addDays(now, 45),
      colorToken: "#6366f1",
      icon: "Laptop",
      isArchived: false,
      contributions: [
        {
          amountMinor: 6000000,
          date: subDays(now, 12),
          notes: "Bonus allocation",
          accountId: hdfc._id,
        },
      ],
    },
  ]);

  // 11. Create Audit Logs
  await AuditLog.create([
    {
      userId,
      action: "AUTH_LOGIN",
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
      metadata: { method: "credentials" },
    },
    {
      userId,
      action: "SETTINGS_UPDATE",
      ipAddress: "127.0.0.1",
      metadata: { updatedFields: ["theme", "currency", "timezone"] },
    },
    {
      userId,
      action: "TRANSACTION_MUTATION",
      ipAddress: "127.0.0.1",
      metadata: { type: "income", category: "Salary" },
    },
  ]);

  return {
    email,
    password: rawPassword,
    name,
    accountsCount: 4,
    categoriesCount: categories.length,
    transactionsCount: txList.length,
    budgetsCount: 4,
    recurringCount: 4,
    billsCount: 4,
    goalsCount: 3,
  };
}
