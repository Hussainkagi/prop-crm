"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
import {
  fetchPaymentPlans,
  type ApiPaymentPlan,
} from "@/lib/api/payment-plan-api";
import {
  fetchMilestone,
  updateMilestone,
  type UpdateMilestonePayload,
} from "@/lib/api/milestone-api";

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
  const searchParams = useSearchParams();

  // milestone_id comes from the route: /settings/payment-plans/milestones/[id]/edit
  const milestoneId = params?.id ? parseInt(String(params.id), 10) : null;
  // plan_id can be passed as a query param: ?plan_id=5
  const planIdFromQuery = searchParams?.get("plan_id");

  const [formData, setFormData] = useState<MilestoneFormData>({
    plan_id: planIdFromQuery || "",
    milestone_sequence: "",
    milestone_name: "",
    milestone_percentage: "",
    days_from_previous: "0",
    amount_type: "Percentage",
    expected_days_from_booking: "",
  });

  const [paymentPlans, setPaymentPlans] = useState<ApiPaymentPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingMilestone, setLoadingMilestone] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountTypes = ["Percentage", "Fixed Amount"];

  // Load payment plans
  useEffect(() => {
    async function loadPlans() {
      try {
        setLoadingPlans(true);
        const res = await fetchPaymentPlans(1, 100);
        setPaymentPlans(res.data);
      } catch (err) {
        console.error("Failed to load payment plans:", err);
        setError("Failed to load payment plans");
      } finally {
        setLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  // Load milestone data
  useEffect(() => {
    if (!milestoneId || !formData.plan_id) {
      setLoadingMilestone(false);
      return;
    }

    async function loadMilestone() {
      try {
        setLoadingMilestone(true);
        const planId = parseInt(formData.plan_id, 10);
        const res = await fetchMilestone(planId, milestoneId!);
        const m = res.data;
        setFormData({
          plan_id: String(m.plan_id),
          milestone_sequence: String(m.milestone_sequence),
          milestone_name: m.milestone_name,
          milestone_percentage: String(m.milestone_percentage),
          days_from_previous: String(m.days_from_previous),
          amount_type: m.amount_type,
          expected_days_from_booking: String(m.expected_days_from_booking),
        });
      } catch (err) {
        console.error("Failed to load milestone:", err);
        setError("Failed to load milestone data");
      } finally {
        setLoadingMilestone(false);
      }
    }

    loadMilestone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneId, planIdFromQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.plan_id || !milestoneId) {
      setError("Missing plan or milestone ID");
      return;
    }

    const planId = parseInt(formData.plan_id, 10);
    const payload: UpdateMilestonePayload = {
      milestone_sequence: parseInt(formData.milestone_sequence, 10),
      milestone_name: formData.milestone_name,
      milestone_percentage: parseFloat(formData.milestone_percentage),
      days_from_previous: parseInt(formData.days_from_previous, 10),
      amount_type: formData.amount_type,
      expected_days_from_booking: parseInt(
        formData.expected_days_from_booking || "0",
        10,
      ),
    };

    try {
      setSubmitting(true);
      await updateMilestone(planId, milestoneId, payload);
      router.push("/settings/payment-plans");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update milestone";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loadingPlans || loadingMilestone;

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

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Milestone className="h-4 w-4" />
              Milestone Details
            </h3>

            {isLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
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
                        <SelectItem
                          key={plan.plan_id}
                          value={String(plan.plan_id)}
                        >
                          {plan.plan_name}
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
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || isLoading}>
            {submitting ? "Updating..." : "Update Milestone"}
          </Button>
        </div>
      </form>
    </div>
  );
}
