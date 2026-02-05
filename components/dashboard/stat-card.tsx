"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  color: "blue" | "green" | "purple" | "orange"
}

const colorClasses = {
  blue: "bg-blue-500 text-white",
  green: "bg-green-500 text-white",
  purple: "bg-purple-500 text-white",
  orange: "bg-orange-500 text-white",
}

export function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <div className={cn("rounded-lg p-4", colorClasses[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs opacity-75">{subtitle}</p>
        </div>
        <Icon className="h-6 w-6 opacity-75" />
      </div>
    </div>
  )
}
