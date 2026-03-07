"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createPaymentPlan,
  type CreatePaymentPlanPayload,
} from "@/lib/api/payment-plan-api";
import { showSplashLoader, hideSplashLoader } from "@/utils/splash-loader";

interface PaymentPlanFormData {
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
  early_bird_discount: string;
  referral_bonus: string;
}

const PLAN_TYPES = [
  "Construction Linked",
  "Time Linked",
  "Down Payment",
  "Flexi",
  "Custom",
];

export default function CreatePaymentPlanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PaymentPlanFormData>({
    plan_name: "",
    plan_code: "",
    plan_description: "",
    plan_type: "Construction Linked",
    total_installments: "",
    booking_amount_percentage: "",
    down_payment_percentage: "",
    on_agreement_percentage: "",
    on_possession_percentage: "",
    grace_period_days: "7",
    late_payment_charge_percentage: "",
    penalty_terms: "",
    early_payment_discount_percentage: "",
    vat_applicable: true,
    vat_percentage: "5.00",
    stamp_duty_included: false,
    early_bird_discount: "",
    referral_bonus: "",
  });

  const set = (field: keyof PaymentPlanFormData, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const toOptionalNum = (v: string) => (v.trim() ? Number(v) : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Build special_offers only if either field is filled
    const special_offers =
      formData.early_bird_discount || formData.referral_bonus
        ? {
            ...(formData.early_bird_discount && {
              early_bird_discount: formData.early_bird_discount,
            }),
            ...(formData.referral_bonus && {
              referral_bonus: formData.referral_bonus,
            }),
          }
        : undefined;

    const payload: CreatePaymentPlanPayload = {
      plan_name: formData.plan_name,
      plan_code: formData.plan_code || undefined,
      plan_description: formData.plan_description || undefined,
      plan_type: formData.plan_type,
      total_installments: toOptionalNum(formData.total_installments),
      booking_amount_percentage: toOptionalNum(
        formData.booking_amount_percentage,
      ),
      down_payment_percentage: toOptionalNum(formData.down_payment_percentage),
      on_agreement_percentage: toOptionalNum(formData.on_agreement_percentage),
      on_possession_percentage: toOptionalNum(
        formData.on_possession_percentage,
      ),
      grace_period_days: toOptionalNum(formData.grace_period_days),
      late_payment_charge_percentage: toOptionalNum(
        formData.late_payment_charge_percentage,
      ),
      penalty_terms: formData.penalty_terms || undefined,
      early_payment_discount_percentage: toOptionalNum(
        formData.early_payment_discount_percentage,
      ),
      vat_applicable: formData.vat_applicable,
      vat_percentage: formData.vat_applicable
        ? toOptionalNum(formData.vat_percentage)
        : undefined,
      stamp_duty_included: formData.stamp_duty_included,
      special_offers,
    };

    setIsSubmitting(true);
    showSplashLoader("Creating payment plan...");
    try {
      await createPaymentPlan(payload);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create payment plan.",
      );
    } finally {
      setTimeout(() => {
        router.push("/settings/payments");
        hideSplashLoader();
      }, 500); // Ensure loader is visible for at least 500ms for better UX

      setIsSubmitting(false);
    }
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
            Create a master payment plan template to link to projects
          </p>
        </div>
      </div>

      {submitError && (
        <Alert variant="destructive" className="max-w-4xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

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
                <Label htmlFor="plan_name">Plan Name *</Label>
                <Input
                  id="plan_name"
                  value={formData.plan_name}
                  onChange={(e) => set("plan_name", e.target.value)}
                  placeholder="e.g., Construction Linked Plan - Standard"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_code">Plan Code</Label>
                <Input
                  id="plan_code"
                  value={formData.plan_code}
                  onChange={(e) => set("plan_code", e.target.value)}
                  placeholder="e.g., CLP-STD-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_type">Plan Type *</Label>
                <Select
                  value={formData.plan_type}
                  onValueChange={(v) => set("plan_type", v)}
                >
                  <SelectTrigger id="plan_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
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
                  onChange={(e) => set("plan_description", e.target.value)}
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
                <Label htmlFor="total_installments">Total Installments</Label>
                <Input
                  id="total_installments"
                  type="number"
                  min={1}
                  value={formData.total_installments}
                  onChange={(e) => set("total_installments", e.target.value)}
                  placeholder="e.g., 8"
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
                    set("booking_amount_percentage", e.target.value)
                  }
                  placeholder="e.g., 10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="down_payment_percentage">
                  Down Payment (%)
                </Label>
                <Input
                  id="down_payment_percentage"
                  type="number"
                  step="0.01"
                  value={formData.down_payment_percentage}
                  onChange={(e) =>
                    set("down_payment_percentage", e.target.value)
                  }
                  placeholder="e.g., 15"
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
                    set("on_agreement_percentage", e.target.value)
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
                    set("on_possession_percentage", e.target.value)
                  }
                  placeholder="e.g., 15"
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
                  onChange={(e) => set("grace_period_days", e.target.value)}
                  placeholder="e.g., 7"
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
                    set("late_payment_charge_percentage", e.target.value)
                  }
                  placeholder="e.g., 18"
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
                    set("early_payment_discount_percentage", e.target.value)
                  }
                  placeholder="e.g., 2"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="penalty_terms">Penalty Terms</Label>
                <Textarea
                  id="penalty_terms"
                  value={formData.penalty_terms}
                  onChange={(e) => set("penalty_terms", e.target.value)}
                  placeholder="e.g., 18% per annum on delayed payments after grace period"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Offers */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Special Offers</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="early_bird_discount">Early Bird Discount</Label>
                <Input
                  id="early_bird_discount"
                  value={formData.early_bird_discount}
                  onChange={(e) => set("early_bird_discount", e.target.value)}
                  placeholder="e.g., 2% if booked before Dec 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_bonus">Referral Bonus</Label>
                <Input
                  id="referral_bonus"
                  value={formData.referral_bonus}
                  onChange={(e) => set("referral_bonus", e.target.value)}
                  placeholder="e.g., AED 5000 on successful referral"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Tax</h3>
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
                  onCheckedChange={(v) => set("vat_applicable", v)}
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
                    onChange={(e) => set("vat_percentage", e.target.value)}
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
                  onCheckedChange={(v) => set("stamp_duty_included", v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Payment Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
