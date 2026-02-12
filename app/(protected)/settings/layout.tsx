"use client";

import { User, Palette, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const settingsOptions = [
  {
    id: "users",
    label: "User Management",
    icon: User,
    description: "Manage user accounts and permissions",
    path: "/settings/users",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    description: "Customize how the application looks",
    path: "/settings/appearance",
  },
] as const;

interface SettingsLayoutProps {
  children: ReactNode;
}

function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActiveRoute = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col lg:h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
      {/* Mobile Header - Shows current page */}
      <div className="border-b bg-background p-4 lg:hidden">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden w-80 border-r bg-background lg:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <nav className="space-y-1 px-3">
          {settingsOptions.map((option) => {
            const Icon = option.icon;
            const isActive = isActiveRoute(option.path);
            return (
              <button
                key={option.id}
                onClick={() => router.push(option.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation List - Only shown on /settings root */}
      {pathname === "/settings" && (
        <div className="divide-y lg:hidden">
          {settingsOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => router.push(option.path)}
                className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}

export default SettingsLayout;
