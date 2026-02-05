"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  unit: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  totalDue: string;
  nextDue: string;
  dueDate: string;
  status: string;
  daysOverdue: number;
  paymentProgress: number;
  amountPaid: string;
  totalAmount: string;
}

interface PrioritizedCustomerCardProps {
  customer: Customer;
  onCallClick: (customer: Customer) => void;
}

export function PrioritizedCustomerCard({
  customer,
  onCallClick,
}: PrioritizedCustomerCardProps) {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <Badge
                variant={getPriorityVariant(customer.priority)}
                className="text-xs"
              >
                {customer.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
            <p className="text-sm text-muted-foreground">
              Unit: {customer.unit}
            </p>
          </div>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onCallClick(customer)}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Due</p>
            <p className="text-base font-semibold text-red-600">
              {customer.totalDue}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Next Due</p>
            <p className="text-base font-semibold text-red-600">
              {customer.nextDue}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="text-base font-medium">{customer.dueDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="flex items-center gap-1 text-base font-medium text-orange-600">
              <span className="text-orange-600">⚠</span>
              {customer.status}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Payment Progress</span>
            <span className="font-medium">{customer.paymentProgress}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${customer.paymentProgress}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{customer.amountPaid} paid</span>
            <span>{customer.totalAmount} total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
