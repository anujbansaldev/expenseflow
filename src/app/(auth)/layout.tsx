import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2.5 mb-8 select-none group">
        <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-border group-hover:scale-105 transition-transform shrink-0">
          <Image
            src="/logo.png"
            alt="ExpenseFlow Logo"
            fill
            sizes="36px"
            className="object-contain"
            priority
          />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground font-serif">ExpenseFlow</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
