import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center justify-center mb-8 select-none group">
        <Image
          src="/logo.png"
          alt="ExpenseFlow"
          width={240}
          height={60}
          className="h-12 w-auto max-w-[260px] object-contain group-hover:opacity-95 transition-opacity"
          priority
        />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
