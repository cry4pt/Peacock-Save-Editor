"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  MapPin,
  TrendingUp,
  BookOpen,
  Settings,
  User,
  Search,
  ChevronRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const pages = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Challenges", href: "/challenges", icon: Trophy },
  { name: "Locations", href: "/locations", icon: MapPin },
  { name: "Escalations", href: "/escalations", icon: TrendingUp },
  { name: "Stories", href: "/stories", icon: BookOpen },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface QuickSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearch({ open, onOpenChange }: QuickSearchProps) {
  const router = useRouter();

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              value={page.name}
              onSelect={() => runCommand(() => router.push(page.href))}
              className="group flex items-center gap-4 rounded-lg border border-transparent p-3 transition-all duration-200 text-foreground data-[selected=true]:text-foreground data-[selected=true]:border-primary/50 data-[selected=true]:bg-primary/5 aria-selected:text-foreground aria-selected:border-primary/50 aria-selected:bg-primary/5"
            >
              <div className="rounded-lg bg-primary/10 p-2.5">
                <page.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="flex-1 font-medium">{page.name}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

interface QuickSearchButtonProps {
  onClick: () => void;
}

export function QuickSearchButton({ onClick }: QuickSearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Search className="h-4 w-4" />
      <span>Quick Search</span>
      <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
