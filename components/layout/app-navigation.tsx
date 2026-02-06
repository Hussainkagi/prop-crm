"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building,
  Users,
  Phone,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavigationTab =
  | "dashboard"
  | "developers"
  | "projects"
  | "customers"
  | "call-center"
  | "settings";

interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard & Reports",
    icon: BarChart3,
    href: "/dashboard",
  },
  {
    id: "developers",
    label: "Developers",
    icon: Building,
    href: "/developers",
  },
  { id: "projects", label: "Projects", icon: FileText, href: "/projects" },
  { id: "customers", label: "Customers", icon: Users, href: "/customers" },
  {
    id: "call-center",
    label: "Call Center",
    icon: Phone,
    href: "/call-center",
  },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = (): NavigationTab => {
    const currentPath = pathname.split("/")[1];
    return (currentPath as NavigationTab) || "dashboard";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="border-b bg-card">
      <div className="flex overflow-x-auto px-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors md:text-base lg:gap-3 lg:px-5 lg:py-4",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
