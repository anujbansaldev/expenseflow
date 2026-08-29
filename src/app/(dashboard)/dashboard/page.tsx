import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here is a summary of your accounts and cash flow for this month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/transactions">
            <Button size="sm" className="gap-1.5 font-semibold">
              <Plus className="w-4 h-4" />
              New Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Balance
            </CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight">₹1,24,500.00</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold inline-flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
              </span>{" "}
              vs last month
            </p>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Income (Aug)
            </CardTitle>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              +₹85,000.00
            </div>
            <p className="text-xs text-muted-foreground mt-1">2 income events recorded</p>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Expenses (Aug)
            </CardTitle>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
              −₹32,450.00
            </div>
            <p className="text-xs text-muted-foreground mt-1">42% of ₹75,000 budget</p>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Savings
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
              +₹52,550.00
            </div>
            <p className="text-xs text-muted-foreground mt-1">61.8% savings rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Transactions & Account Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
              <CardDescription>Latest financial activity across all your accounts</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Salary Deposit", category: "Income", account: "HDFC Salary", amount: "+₹85,000.00", date: "28 Aug 2026", type: "income" },
                { name: "Grocery Supermarket", category: "Food & Dining", account: "ICICI Credit Card", amount: "−₹3,240.00", date: "27 Aug 2026", type: "expense" },
                { name: "Electricity Bill", category: "Utilities", account: "HDFC Salary", amount: "−₹1,850.00", date: "25 Aug 2026", type: "expense" },
                { name: "Transfer to Savings", category: "Transfer", account: "HDFC -> SBI", amount: "₹20,000.00", date: "24 Aug 2026", type: "transfer" },
              ].map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        tx.type === "income"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : tx.type === "expense"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {tx.type === "income" ? "IN" : tx.type === "expense" ? "EX" : "TR"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{tx.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] py-0">
                          {tx.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{tx.account}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        tx.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : tx.type === "expense"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-foreground"
                      }`}
                    >
                      {tx.amount}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accounts & Upcoming Bills Side Panel */}
        <div className="space-y-6">
          {/* Active Accounts */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Accounts</CardTitle>
              <Link href="/accounts" className="text-xs text-primary hover:underline">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "HDFC Primary Checking", balance: "₹74,500.00", type: "Bank" },
                { name: "SBI Savings Deposit", balance: "₹45,000.00", type: "Savings" },
                { name: "ICICI Coral Card", balance: "−₹5,000.00", type: "Credit Card" },
              ].map((acc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-card"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold">{acc.name}</p>
                      <span className="text-[10px] text-muted-foreground">{acc.type}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono">{acc.balance}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Bills */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                Upcoming Bills
              </CardTitle>
              <Link href="/bills" className="text-xs text-primary hover:underline">
                All Bills
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded border border-border">
                <div>
                  <p className="font-semibold">Broadband Internet</p>
                  <p className="text-muted-foreground text-[10px]">Due in 3 days (1 Sep)</p>
                </div>
                <Badge variant="warning">₹1,199.00</Badge>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded border border-border">
                <div>
                  <p className="font-semibold">Cloud Storage Subscription</p>
                  <p className="text-muted-foreground text-[10px]">Due in 6 days (4 Sep)</p>
                </div>
                <Badge variant="secondary">₹210.00</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
