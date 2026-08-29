import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ArrowRight,
  Receipt,
  PieChart,
  Repeat,
  CalendarCheck,
  Target,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Editorial Navigation Header */}
      <header className="border-b border-border bg-card/90 backdrop-blur-xs sticky top-0 z-50 h-16 flex items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground font-serif font-bold text-sm flex items-center justify-center border border-amber-500/30">
            EF
          </div>
          <span className="font-serif font-bold text-lg tracking-tight text-foreground">
            ExpenseFlow
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-muted-foreground">
          <a href="#product" className="hover:text-foreground transition-colors">Product</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#methodology" className="hover:text-foreground transition-colors">Methodology</a>
          <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-xs font-semibold">
              Start Tracking Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 pt-16 pb-12 max-w-5xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-border bg-card text-muted-foreground text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Strict Zero-Floating-Point Financial Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground leading-[1.15] mb-6">
          Know where your money goes. <br className="hidden sm:inline" />
          <span className="italic text-primary">Decide where it should go next.</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          A disciplined financial management platform built for individuals who demand precision. 
          Multi-account ledgers, envelope budgets, recurring schedules, and fiscal analysis without spreadsheet chaos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 text-sm px-6 h-11">
              <span>Start Tracking Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold text-sm px-6 h-11">
              Explore Live Demo
            </Button>
          </Link>
        </div>

        {/* Integrated Realistic Application Preview */}
        <div id="product" className="rounded-lg border border-border bg-card p-4 sm:p-6 text-left shadow-sm max-w-4xl mx-auto">
          {/* Top Preview Bar */}
          <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="text-xs font-serif font-semibold text-muted-foreground ml-2">
                Executive Financial Command Center — August 2026
              </span>
            </div>
            <Badge variant="gold" className="text-[10px]">Active Ledger Session</Badge>
          </div>

          {/* KPI Snapshot Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded border border-border/70 bg-background/50">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Net Position</span>
              <span className="text-xl font-bold font-mono text-foreground mt-1 block">₹5,74,451</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 block font-medium">+8.2% from last month</span>
            </div>
            <div className="p-3.5 rounded border border-border/70 bg-background/50">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Monthly Inflow</span>
              <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">+₹1,50,000</span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">Salary &amp; Dividends</span>
            </div>
            <div className="p-3.5 rounded border border-border/70 bg-background/50">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Monthly Outflow</span>
              <span className="text-xl font-bold font-mono text-rose-800 dark:text-rose-400 mt-1 block">−₹77,049</span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">Housing, Living &amp; Tech</span>
            </div>
            <div className="p-3.5 rounded border border-border/70 bg-background/50">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Savings Rate</span>
              <span className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-1 block">48.6%</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 block font-medium">+₹72,951 retained</span>
            </div>
          </div>

          {/* Split Ledger Table & Envelope Budgets */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Recent Ledger Entries (3 cols) */}
            <div className="lg:col-span-3 rounded border border-border/70 bg-background/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Ledger Entries</h4>
                <span className="text-[10px] font-mono text-muted-foreground">5 of 24 records</span>
              </div>
              <div className="space-y-2">
                {[
                  { date: "29 Aug", name: "Acme Corp Tech Salary", cat: "Salary", acc: "HDFC Bank", amt: "+₹1,50,000", isInc: true },
                  { date: "27 Aug", name: "Apartment Rent Payment", cat: "Housing", acc: "HDFC Bank", amt: "−₹35,000", isInc: false },
                  { date: "25 Aug", name: "Keychron Q1 Mechanical", cat: "Tech", acc: "Amex Card", amt: "−₹8,990", isInc: false },
                  { date: "23 Aug", name: "Zepto Supermarket Order", cat: "Groceries", acc: "HDFC Bank", amt: "−₹3,240", isInc: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground text-[10px]">{item.date}</span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className={`font-mono font-bold ${item.isInc ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>
                      {item.amt}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Envelopes (2 cols) */}
            <div className="lg:col-span-2 rounded border border-border/70 bg-background/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Envelopes</h4>
                <span className="text-[10px] font-medium text-primary">August Targets</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Groceries &amp; Market</span>
                    <span className="font-mono text-[11px]">₹14,690 / ₹25,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-emerald-700 dark:bg-emerald-500 rounded" style={{ width: "58%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Dining &amp; Cafes</span>
                    <span className="font-mono text-[11px] text-amber-800 dark:text-amber-300">₹12,730 / ₹15,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-amber-600 dark:bg-amber-500 rounded" style={{ width: "85%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Tech &amp; Hardware</span>
                    <span className="font-mono text-[11px]">₹8,990 / ₹20,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-primary rounded" style={{ width: "45%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Feature Section 1: Ledger & Tracking */}
      <section id="features" className="border-t border-border py-20 px-6 lg:px-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Core Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-snug">
              Track every rupee without the spreadsheet headache.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-normal">
              Most expense apps store floating-point currency numbers that drift over time. 
              ExpenseFlow persists every amount in minor units (paise/cents) as pure integers, 
              guaranteeing mathematical accuracy down to the last decimal across multi-account transfers.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-foreground font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Atomic double-entry transfer mechanics between checking, savings, and credit cards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Real-time derived account balance computation directly from ledger history</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Full audit logging and historical non-destructive archiving</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="font-serif font-bold text-base mb-4 text-foreground">Multi-Account Balance Topology</h3>
            <div className="space-y-3">
              {[
                { name: "HDFC Salary Checking", type: "Bank Account", balance: "₹3,42,850", status: "Primary" },
                { name: "ICICI Wealth Savings", type: "High-Yield Savings", balance: "₹1,85,000", status: "Yield 7.2%" },
                { name: "Amex Platinum Credit Card", type: "Credit Line", balance: "−₹12,450", status: "Due in 14d" },
                { name: "Physical Cash Pocket", type: "Cash Wallet", balance: "₹4,051", status: "Active" },
              ].map((acc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded border border-border/60 bg-background/50 text-xs">
                  <div>
                    <span className="font-semibold text-foreground block">{acc.name}</span>
                    <span className="text-[10px] text-muted-foreground">{acc.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-foreground block">{acc.balance}</span>
                    <span className="text-[10px] text-muted-foreground">{acc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Feature Section 2: Budgeting & Envelopes */}
      <section className="border-t border-border bg-card/40 py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="font-serif font-bold text-base mb-4 text-foreground">Intelligent Threshold States</h3>
            <div className="space-y-4">
              <div className="p-3.5 rounded border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex justify-between text-xs font-semibold mb-1 text-emerald-800 dark:text-emerald-300">
                  <span>Groceries Envelope</span>
                  <span>58% • Safe</span>
                </div>
                <span className="text-[11px] text-muted-foreground block">₹14,690 spent of ₹25,000 monthly allowance</span>
              </div>

              <div className="p-3.5 rounded border border-amber-500/20 bg-amber-500/5">
                <div className="flex justify-between text-xs font-semibold mb-1 text-amber-800 dark:text-amber-300">
                  <span>Dining &amp; Cafes Envelope</span>
                  <span>85% • Alert Threshold Reached</span>
                </div>
                <span className="text-[11px] text-muted-foreground block">₹12,730 spent of ₹15,000 (Approaching cap)</span>
              </div>

              <div className="p-3.5 rounded border border-rose-500/20 bg-rose-500/5">
                <div className="flex justify-between text-xs font-semibold mb-1 text-rose-800 dark:text-rose-300">
                  <span>Entertainment &amp; OTT Envelope</span>
                  <span>113% • Cap Exceeded</span>
                </div>
                <span className="text-[11px] text-muted-foreground block">₹5,639 spent of ₹5,000 (Over by ₹639)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Proactive Discipline</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-snug">
              Envelope budgeting that prevents overspending before it happens.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-normal">
              Set monthly category spending caps with custom warning thresholds. 
              Instead of looking at backward-facing spreadsheets at the end of the month, ExpenseFlow visually alerts you the moment spending accelerates.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-foreground font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0" />
                <span>80% and custom warning threshold trigger states</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0" />
                <span>Zero interference with savings transfers or debt repayment flows</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Methodology & Financial Architecture */}
      <section id="methodology" className="border-t border-border py-20 px-6 lg:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Financial Methodology</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mt-2 mb-4">
            Built for clarity, privacy, and permanence.
          </h2>
          <p className="text-sm text-muted-foreground">
            We reject the typical venture-backed advertising model. Your financial records belong strictly to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-border bg-card">
            <Landmark className="w-6 h-6 text-primary mb-4" />
            <h3 className="font-serif font-bold text-base mb-2">Double-Entry Invariants</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-normal">
              Transfers between your accounts do not skew your income or expense metrics. Every credit has an atomic corresponding debit.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <Lock className="w-6 h-6 text-amber-700 dark:text-amber-300 mb-4" />
            <h3 className="font-serif font-bold text-base mb-2">Isolated Multi-Tenant Security</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-normal">
              Every query is verified server-side against cryptographic JWT sessions. Zero client-side authorization leakage is possible.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <FileSpreadsheet className="w-6 h-6 text-primary mb-4" />
            <h3 className="font-serif font-bold text-base mb-2">Formula-Safe CSV Export</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-normal">
              Exports are sanitized to prevent spreadsheet formula injection attacks, ensuring your data is portable and safe in Excel or Numbers.
            </p>
          </div>
        </div>
      </section>

      {/* Clean 2-Tier Pricing Section */}
      <section id="pricing" className="border-t border-border bg-card/30 py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto w-full text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Transparent Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mt-2 mb-3">
            Honest software with zero hidden advertisements.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            No bank data mining, no third-party telemetry, no credit card promotions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-lg border border-border bg-card p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-foreground">Standard Edition</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">For everyday personal expense tracking</p>
                </div>
                <Badge variant="outline">Free Forever</Badge>
              </div>

              <div className="my-6">
                <span className="text-3xl font-bold font-mono">₹0</span>
                <span className="text-xs text-muted-foreground ml-1">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground mb-8">
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>Unlimited Ledger Transactions</span>
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>Up to 5 Active Financial Accounts</span>
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>Category Envelopes &amp; Warning Alerts</span>
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>Standard CSV Export</span>
                </li>
              </ul>
            </div>

            <Link href="/register" className="w-full">
              <Button variant="outline" className="w-full text-xs font-semibold">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="rounded-lg border-2 border-primary bg-card p-6 flex flex-col justify-between shadow-sm relative">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-foreground">Investor &amp; Pro</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">For complex multi-account capital management</p>
                </div>
                <Badge variant="gold">Recommended</Badge>
              </div>

              <div className="my-6">
                <span className="text-3xl font-bold font-mono">₹499</span>
                <span className="text-xs text-muted-foreground ml-1">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground mb-8">
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Everything in Standard Edition</span>
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Unlimited Accounts &amp; Custom Categories</span>
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Automated Recurrence Engine via CRON API</span>
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Fiscal Year Spending Variance Analytics</span>
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Priority Encryption Audit Logging</span>
                </li>
              </ul>
            </div>

            <Link href="/register" className="w-full">
              <Button className="w-full text-xs font-semibold shadow-sm">
                Start 14-Day Free Pro Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Publication Footer */}
      <footer className="border-t border-border bg-card py-12 px-6 lg:px-12 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground font-serif font-bold text-xs flex items-center justify-center">
              EF
            </div>
            <span className="font-serif font-semibold text-foreground">ExpenseFlow Financial Ledger</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Live Dashboard</Link>
          </div>

          <p className="text-[11px]">
            &copy; {new Date().getFullYear()} ExpenseFlow Inc. Crafted with mathematical discipline.
          </p>
        </div>
      </footer>
    </div>
  );
}
