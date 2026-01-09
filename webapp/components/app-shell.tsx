"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Trophy,
  MapPin,
  TrendingUp,
  BookOpen,
  Settings,
  Crosshair,
  Menu,
  X,
  AlertCircle,
  RefreshCw,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getStatus, type StatusResponse } from "@/lib/api";
import { QuickSearch, QuickSearchButton } from "@/components/quick-search";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, id: "dashboard" },
  { name: "Challenges", href: "/challenges", icon: Trophy, id: "challenges" },
  { name: "Locations", href: "/locations", icon: MapPin, id: "locations" },
  {
    name: "Escalations",
    href: "/escalations",
    icon: TrendingUp,
    id: "escalations",
  },
  { name: "Stories", href: "/stories", icon: BookOpen, id: "stories" },
  { name: "Profile", href: "/profile", icon: User, id: "profile" },
  { name: "Settings", href: "/settings", icon: Settings, id: "settings" },
];

interface AppShellProps {
  children: ReactNode;
  activePage: string;
}

export function AppShell({ children, activePage }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    data: status,
    error,
    isLoading,
    mutate,
  } = useSWR<StatusResponse>("/api/status", () => getStatus(), {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  const isConnected = status?.connected && !error;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Crosshair className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Peacock
            </span>
            <span className="text-xs text-muted-foreground">Save Editor</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = item.id === activePage;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", isActive && "text-primary")}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="border-t border-sidebar-border p-4">
          {isLoading ? (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
              <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
              <span className="text-xs text-muted-foreground font-medium">
                Connecting...
              </span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-3 rounded-lg bg-success/10 px-3 py-2.5">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">
                Server Connected
              </span>
            </div>
          ) : (
            <button
              onClick={() => mutate()}
              className="flex w-full items-center gap-3 rounded-lg bg-destructive/10 px-3 py-2.5 hover:bg-destructive/20 transition-colors"
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-destructive font-medium">
                Disconnected - Click to retry
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <QuickSearchButton onClick={() => setSearchOpen(true)} />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      <QuickSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
