"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Milestone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MilestoneFormData {
  plan_id: string;
  milestone_sequence: string;
  milestone_name: string;
  milestone_percentage: string;
  days_from_previous: string;
  amount_type: string;
  expected_days_from_booking: string;
}

export default function EditMilestonePage() {
  const router = useRouter();
  const params = useParams();
  const milestoneId = params?.id;

  const [formData, setFormData] = useState<MilestoneFormData>({
    plan_id: "1",
    milestone_sequence: "1",
    milestone_name: "Booking Amount",
    milestone_percentage: "10",
    days_from_previous: "0",
    amount_type: "Percentage",
    expected_days_from_booking: "0",
  });

  const paymentPlans = [
    { id: "1", name: "20-80 Standard Plan - Skyline Heights" },
    { id: "2", name: "30-70 Fast Track - Skyline Heights" },
  ];

  const amountTypes = ["Percentage", "Fixed Amount"];

  useEffect(() => {
    // Fetch milestone data based on milestoneId
    console.log("Fetching milestone:", milestoneId);
  }, [milestoneId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating milestone:", milestoneId, formData);
    router.push("/settings/payment-plans");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Payment Milestone</h1>
          <p className="text-sm text-muted-foreground">
            Update milestone details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Milestone className="h-4 w-4" />
              Milestone Details
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="plan_id">Payment Plan *</Label>
                <Select
                  value={formData.plan_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, plan_id: value }))
                  }
                >
                  <SelectTrigger id="plan_id">
                    <SelectValue placeholder="Select Payment Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="milestone_sequence">Sequence Number *</Label>
                <Input
                  id="milestone_sequence"
                  type="number"
                  min="1"
                  value={formData.milestone_sequence}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      milestone_sequence: e.target.value,
                    }))
                  }
                  placeholder="e.g., 1"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Order in which this milestone appears
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="milestone_name">Milestone Name *</Label>
                <Input
                  id="milestone_name"
                  value={formData.milestone_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      milestone_name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Booking Amount"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_type">Amount Type *</Label>
                <Select
                  value={formData.amount_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, amount_type: value }))
                  }
                >
                  <SelectTrigger id="amount_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {amountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="milestone_percentage">
                  {formData.amount_type === "Percentage"
                    ? "Percentage (%)"
                    : "Fixed Amount"}{" "}
                  *
                </Label>
                <Input
                  id="milestone_percentage"
                  type="number"
                  step="0.01"
                  value={formData.milestone_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      milestone_percentage: e.target.value,
                    }))
                  }
                  placeholder={
                    formData.amount_type === "Percentage"
                      ? "e.g., 10"
                      : "e.g., 50000"
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days_from_previous">
                  Days from Previous Milestone
                </Label>
                <Input
                  id="days_from_previous"
                  type="number"
                  min="0"
                  value={formData.days_from_previous}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      days_from_previous: e.target.value,
                    }))
                  }
                  placeholder="e.g., 30"
                />
                <p className="text-xs text-muted-foreground">
                  Number of days after the previous milestone
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_days_from_booking">
                  Expected Days from Booking
                </Label>
                <Input
                  id="expected_days_from_booking"
                  type="number"
                  min="0"
                  value={formData.expected_days_from_booking}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expected_days_from_booking: e.target.value,
                    }))
                  }
                  placeholder="e.g., 90"
                />
                <p className="text-xs text-muted-foreground">
                  Total days from booking date
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Update Milestone</Button>
        </div>
      </form>
    </div>
  );
}
