import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8 select-none">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-primary-foreground shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-bold text-xl tracking-tight">ExpenseFlow</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
