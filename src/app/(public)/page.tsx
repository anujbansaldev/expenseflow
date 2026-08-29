import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, ArrowRight, Wallet, PieChart, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border/60 backdrop-blur-md sticky top-0 z-50 bg-background/80 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-primary-foreground shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">ExpenseFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Open App</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6 animate-pulse">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Strict Zero-Float Financial Engine</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Master your money with{" "}
          <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            precision and clarity
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          A modern, private and secure expense management suite with real-time multi-account tracking, budget envelopes, recurring bills, and comprehensive financial analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 font-semibold shadow-lg shadow-primary/20">
              Launch Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Feature Grid Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <Wallet className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-semibold text-base mb-1">Multi-Account Ledger</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track bank accounts, credit cards, cash, and digital wallets with atomic transfer support.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <PieChart className="w-6 h-6 text-emerald-500 mb-3" />
            <h3 className="font-semibold text-base mb-1">Budget Envelopes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Set categorized budgets with proactive threshold warnings and automatic rollover options.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <TrendingUp className="w-6 h-6 text-indigo-500 mb-3" />
            <h3 className="font-semibold text-base mb-1">Deep Analytics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Understand your cash flow, net worth trajectory, and spending patterns with interactive visual charts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        ExpenseFlow &copy; {new Date().getFullYear()} — Built with Next.js App Router, TypeScript &amp; MongoDB.
      </footer>
    </div>
  );
}
