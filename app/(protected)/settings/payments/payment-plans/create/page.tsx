"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface PaymentPlanFormData {
  project_id: string;
  plan_name: string;
  plan_code: string;
  plan_description: string;
  plan_type: string;
  total_installments: string;
  booking_amount_percentage: string;
  down_payment_percentage: string;
  on_agreement_percentage: string;
  on_possession_percentage: string;
  grace_period_days: string;
  late_payment_charge_percentage: string;
  penalty_terms: string;
  early_payment_discount_percentage: string;
  vat_applicable: boolean;
  vat_percentage: string;
  stamp_duty_included: boolean;
  plan_status: string;
}

export default function CreatePaymentPlanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PaymentPlanFormData>({
    project_id: "",
    plan_name: "",
    plan_code: "",
    plan_description: "",
    plan_type: "Construction Linked",
    total_installments: "",
    booking_amount_percentage: "",
    down_payment_percentage: "",
    on_agreement_percentage: "",
    on_possession_percentage: "",
    grace_period_days: "15",
    late_payment_charge_percentage: "",
    penalty_terms: "",
    early_payment_discount_percentage: "",
    vat_applicable: true,
    vat_percentage: "5.00",
    stamp_duty_included: false,
    plan_status: "Active",
  });

  const projects = [
    { id: "1", name: "Skyline Heights" },
    { id: "2", name: "Green Valley Residency" },
  ];

  const planTypes = [
    "Construction Linked",
    "Time Linked",
    "Possession Linked",
    "Flexi Payment",
    "Custom",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
    router.push("/settings/payment-plans");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Payment Plan</h1>
          <p className="text-sm text-muted-foreground">
            Add a new payment plan for a project
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Banknote className="h-4 w-4" />
              Basic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, project_id: value }))
                  }
                >
                  <SelectTrigger id="project_id">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_name">Plan Name *</Label>
                <Input
                  id="plan_name"
                  value={formData.plan_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      plan_name: e.target.value,
                    }))
                  }
                  placeholder="e.g., 20-80 Standard Plan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_code">Plan Code *</Label>
                <Input
                  id="plan_code"
                  value={formData.plan_code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      plan_code: e.target.value,
                    }))
                  }
                  placeholder="e.g., 20-80-STD"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_type">Plan Type *</Label>
                <Select
                  value={formData.plan_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, plan_type: value }))
                  }
                >
                  <SelectTrigger id="plan_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {planTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="plan_description">Plan Description</Label>
                <Textarea
                  id="plan_description"
                  value={formData.plan_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      plan_description: e.target.value,
                    }))
                  }
                  placeholder="Describe the payment plan details"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Structure */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Payment Structure</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="total_installments">Total Installments *</Label>
                <Input
                  id="total_installments"
                  type="number"
                  value={formData.total_installments}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      total_installments: e.target.value,
                    }))
                  }
                  placeholder="e.g., 36"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_amount_percentage">
                  Booking Amount (%)
                </Label>
                <Input
                  id="booking_amount_percentage"
                  type="number"
                  step="0.01"
                  value={formData.booking_amount_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      booking_amount_percentage: e.target.value,
                    }))
                  }
                  placeholder="e.g., 10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="down_payment_percentage">
                  Down Payment (%) *
                </Label>
                <Input
                  id="down_payment_percentage"
                  type="number"
                  step="0.01"
                  value={formData.down_payment_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      down_payment_percentage: e.target.value,
                    }))
                  }
                  placeholder="e.g., 20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="on_agreement_percentage">
                  On Agreement (%)
                </Label>
                <Input
                  id="on_agreement_percentage"
                  type="number"
                  step="0.01"
                  value={formData.on_agreement_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      on_agreement_percentage: e.target.value,
                    }))
                  }
                  placeholder="e.g., 10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="on_possession_percentage">
                  On Possession (%)
                </Label>
                <Input
                  id="on_possession_percentage"
                  type="number"
                  step="0.01"
                  value={formData.on_possession_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      on_possession_percentage: e.target.value,
                    }))
                  }
                  placeholder="e.g., 80"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Terms & Conditions</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grace_period_days">Grace Period (Days)</Label>
                <Input
                  id="grace_period_days"
                  type="number"
                  value={formData.grace_period_days}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      grace_period_days: e.target.value,
                    }))
                  }
                  placeholder="e.g., 15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="late_payment_charge_percentage">
                  Late Payment Charge (%)
                </Label>
                <Input
                  id="late_payment_charge_percentage"
                  type="number"
                  step="0.01"
                  value={formData.late_payment_charge_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      late_payment_charge_percentage: e.target.value,
                    }))
                  }
                  placeholder="e.g., 1.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="early_payment_discount_percentage">
                  Early Payment Discount (%)
                </Label>
                <Input
                  id="early_payment_discount_percentage"
                  type="number"
                  step="0.01"
                  value={formData.early_payment_discount_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      early_payment_discount_percentage: e.target.value,
                    }))
                  }
                  placeholder="e.g., 2"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="penalty_terms">Penalty Terms</Label>
                <Textarea
                  id="penalty_terms"
                  value={formData.penalty_terms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      penalty_terms: e.target.value,
                    }))
                  }
                  placeholder="Describe penalty terms and conditions"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Status */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Tax & Status</h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vat_applicable">VAT Applicable</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply VAT to this payment plan
                  </p>
                </div>
                <Switch
                  id="vat_applicable"
                  checked={formData.vat_applicable}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      vat_applicable: checked,
                    }))
                  }
                />
              </div>

              {formData.vat_applicable && (
                <div className="space-y-2">
                  <Label htmlFor="vat_percentage">VAT Percentage (%)</Label>
                  <Input
                    id="vat_percentage"
                    type="number"
                    step="0.01"
                    value={formData.vat_percentage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vat_percentage: e.target.value,
                      }))
                    }
                    placeholder="5.00"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stamp_duty_included">
                    Stamp Duty Included
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Include stamp duty in this plan
                  </p>
                </div>
                <Switch
                  id="stamp_duty_included"
                  checked={formData.stamp_duty_included}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      stamp_duty_included: checked,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_status">Plan Status</Label>
                <Select
                  value={formData.plan_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, plan_status: value }))
                  }
                >
                  <SelectTrigger id="plan_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Create Payment Plan</Button>
        </div>
      </form>
    </div>
  );
}
