"use client";

import { useRouter } from "next/navigation";
import { Phone, Mail, ArrowRight, Building2 } from "lucide-react";

export interface Developer {
  id: string;
  companyName: string;
  companyType: string;
  contact: string;
  phone: string;
  email: string;
  location: string;
  status: "ACTIVE" | "INACTIVE";
}

interface DeveloperCardProps {
  developer: Developer;
}

export function DeveloperCard({ developer }: DeveloperCardProps) {
  const router = useRouter();
  const isActive = developer.status === "ACTIVE";

  // Deterministic accent color from company name — keep vivid colors, they work in both themes
  const colors = [
    { icon: "bg-blue-600" },
    { icon: "bg-emerald-600" },
    { icon: "bg-violet-600" },
    { icon: "bg-amber-600" },
    { icon: "bg-rose-600" },
    { icon: "bg-cyan-600" },
  ];
  const colorSet = colors[developer.companyName.charCodeAt(0) % colors.length];

  const initials = developer.companyName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={() => router.push(`/developers/${developer.id}`)}
      className="group relative flex items-center gap-5 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all duration-200 ${
          isActive ? colorSet.icon : "bg-muted"
        }`}
      />

      {/* Avatar */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm ${
          isActive ? colorSet.icon : "bg-muted-foreground/30"
        }`}
      >
        {initials || <Building2 className="h-5 w-5" />}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          {/* Company name + type */}
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-foreground leading-tight">
              {developer.companyName}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {developer.companyType}
            </p>
          </div>

          {/* Status badge */}
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
              isActive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isActive ? "bg-emerald-500" : "bg-muted-foreground"
              }`}
            />
            {developer.status}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-xs font-medium text-muted-foreground">
              Contact
            </span>
            <span className="font-medium text-foreground">
              {developer.contact}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground tabular-nums">
              {developer.phone}
            </span>
          </div>

          {developer.email && (
            <div className="flex items-center gap-1.5 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground truncate max-w-[200px]">
                {developer.email}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
    </div>
  );
}
