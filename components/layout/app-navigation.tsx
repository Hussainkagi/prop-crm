"use client"

import React from "react"

import { BarChart3, Building, Users, Phone, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export type NavigationTab =
  | "dashboard"
  | "developers"
  | "projects"
  | "customers"
  | "call-center"
  | "settings"

interface NavigationItem {
  id: NavigationTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard & Reports", icon: BarChart3 },
  { id: "developers", label: "Developers", icon: Building },
  { id: "projects", label: "Projects", icon: FileText },
  { id: "customers", label: "Customers", icon: Users },
  { id: "call-center", label: "Call Center", icon: Phone },
  { id: "settings", label: "Settings", icon: Settings },
]

interface AppNavigationProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
}

export function AppNavigation({ activeTab, onTabChange }: AppNavigationProps) {
  return (
    <nav className="border-b bg-card">
      <div className="flex overflow-x-auto px-6">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
