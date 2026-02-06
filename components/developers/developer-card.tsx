"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <Card>
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
              <div>
                <span className="text-muted-foreground">Location:</span>{" "}
                <span className="font-medium">{developer.location}</span>
              </div>
            </div>
          </div>
          <Badge
            variant={developer.status === "ACTIVE" ? "default" : "secondary"}
          >
            {developer.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
