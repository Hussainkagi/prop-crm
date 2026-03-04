"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export interface Developer {
  id: string;
  companyName: string;
  companyType: string;
  contact: string;
  phone: string;
  location: string;
  status: "ACTIVE" | "INACTIVE";
}

interface DeveloperCardProps {
  developer: Developer;
}

export function DeveloperCard({ developer }: DeveloperCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md group"
      onClick={() => router.push(`/developers/${developer.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{developer.companyName}</h3>
            <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground">Contact:</span>{" "}
                <span className="font-medium">{developer.contact}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span className="font-medium">{developer.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={developer.status === "ACTIVE" ? "default" : "secondary"}
            >
              {developer.status}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
