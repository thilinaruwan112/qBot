"use client";

import { AppName, Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-primary" />
        <AppName />
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
