"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppName, Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Pattern Analyzer" },
    { href: "/high-odd-analyzer", label: "High Odd Analyzer" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-primary" />
        <AppName />
      </div>
      <nav className="hidden md:flex items-center space-x-2 ml-10">
        {navItems.map((item) => (
            <Button asChild variant="link" key={item.href} className={cn("text-muted-foreground hover:text-foreground", { "text-foreground font-semibold": pathname === item.href })}>
                <Link href={item.href}>
                    {item.label}
                </Link>
            </Button>
        ))}
      </nav>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
